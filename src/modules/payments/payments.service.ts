import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderPaymentStatus,
  PaymentAttemptStatus,
  PaymentMethodType,
  Prisma,
  TransactionStatus,
} from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';
import { AlifProvider } from './providers/alif.provider';
import {
  AlifCallbackRequest,
  CancelPaymentRequest,
  InitPaymentRequest,
} from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new LoggerService(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alifProvider: AlifProvider,
  ) {}

  /**
   * Инициализация платежа через Alif Acquiring (WebCheckout)
   */
  async initAlifPayment(dto: InitPaymentRequest, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        paymentMethod: { select: { type: true } },
        user: { select: { id: true, phone: true, email: true, name: true } },
        transaction: { select: { id: true, status: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('У вас нет прав на оплату этого заказа');
    }

    if (order.paymentMethod.type === PaymentMethodType.CASH) {
      throw new ConflictException(
        'Для данного заказа выбран способ оплаты наличными при получении',
      );
    }

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new ConflictException('Заказ уже оплачен');
    }

    if (!order.totalPrice || order.totalPrice <= 0) {
      throw new BadRequestException('Некорректная сумма заказа');
    }

    // Фиксируем попытку оплаты в БД с метаданными
    const paymentAttempt = await this.prisma.paymentAttempt.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        amount: order.totalPrice,
        status: PaymentAttemptStatus.PENDING,
        provider: 'ALIF',
        metadata: {
          gate: dto.gate || null,
          returnUrl: dto.returnUrl || null,
        },
      },
    });

    try {
      const response = await this.alifProvider.initPayment({
        orderId: order.id,
        amount: order.totalPrice,
        gate: dto.gate,
        returnUrl: dto.returnUrl,
        phone: order.user?.phone || undefined,
        email: order.user?.email || undefined,
        info: `Оплата заказа №${order.id} в SmartTJ`,
      });

      if (response.code !== 200 || !response.url) {
        await this.prisma.paymentAttempt.update({
          where: { id: paymentAttempt.id },
          data: {
            status: PaymentAttemptStatus.FAILED,
            errorMessage:
              response.message ||
              'Ошибка инициализации платежа в Alif Acquiring',
            metadata: response as unknown as Prisma.InputJsonValue,
          },
        });

        throw new BadRequestException(
          response.message || 'Ошибка инициализации платежа в Alif Acquiring',
        );
      }

      // Сохраняем полученный paymentUrl и ответ шлюза
      await this.prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          paymentUrl: response.url,
          metadata: response as unknown as Prisma.InputJsonValue,
        },
      });

      return {
        payUrl: response.url,
        orderId: order.id,
        amount: order.totalPrice,
        status: 'pending',
        attemptId: paymentAttempt.id,
      };
    } catch (error: any) {
      await this.prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          status: PaymentAttemptStatus.FAILED,
          errorMessage: error?.message || 'Failed to request Alif payment',
        },
      });

      this.logger.error('Failed to init payment with Alif', {
        orderId: order.id,
        error: error?.message || error,
      });

      throw error;
    }
  }

  /**
   * Обработка Callback (вебхука) от Alif Acquiring
   */
  async handleCallback(dto: AlifCallbackRequest) {
    this.logger.log('Incoming Alif payment callback', dto);

    // Верификация подписи токена
    const isValid = this.alifProvider.verifyResponseToken(
      dto.token,
      dto.orderId,
      dto.status,
      dto.transactionId,
    );

    if (!isValid) {
      this.logger.warn('Callback signature token mismatch', {
        orderId: dto.orderId,
        receivedToken: dto.token,
      });
      try {
        const checkResult = await this.alifProvider.checkTransaction(
          dto.orderId,
        );
        if (checkResult.status !== dto.status) {
          throw new BadRequestException(
            'Invalid callback signature and status',
          );
        }
      } catch {
        throw new BadRequestException('Invalid callback signature');
      }
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { transaction: true, items: true },
    });

    if (!order) {
      this.logger.error(`Order not found for callback ${dto.orderId}`);
      throw new NotFoundException('Order not found');
    }

    // Идемпотентность: если заказ уже оплачен и пришел повторный success callback
    if (
      order.paymentStatus === OrderPaymentStatus.PAID &&
      dto.status === 'ok'
    ) {
      this.logger.log(
        `Order ${order.id} is already marked as PAID. Skipping duplicate callback.`,
      );
      return { success: true, message: 'Order is already marked as PAID' };
    }

    const transactionIdStr = String(dto.transactionId);
    const amountVal = dto.amount
      ? Math.round(Number(dto.amount))
      : order.totalPrice;

    if (dto.status === 'ok' && amountVal < order.totalPrice) {
      this.logger.error(
        `Callback amount ${amountVal} is less than order totalPrice ${order.totalPrice}`,
      );
      throw new BadRequestException('Сумма оплаты меньше стоимости заказа');
    }

    if (dto.status === 'ok') {
      await this.prisma.$transaction(async (tx) => {
        // Обновляем заказ в статус PAID с отметкой paidAt
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: OrderPaymentStatus.PAID,
            paidAt: new Date(),
          },
        });

        // Создаем или обновляем транзакцию с деталями платежа
        if (!order.transaction) {
          await tx.transaction.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              amount: amountVal,
              status: TransactionStatus.SUCCESS,
              provider: 'ALIF',
              providerId: transactionIdStr,
              paymentGate: dto.transaction_type || null,
              payerAccount: dto.account || null,
              payerPhone: dto.phone || null,
              metadata: dto as unknown as Prisma.InputJsonValue,
            },
          });
        } else {
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              status: TransactionStatus.SUCCESS,
              provider: 'ALIF',
              providerId: transactionIdStr,
              paymentGate: dto.transaction_type || null,
              payerAccount: dto.account || null,
              payerPhone: dto.phone || null,
              metadata: dto as unknown as Prisma.InputJsonValue,
            },
          });
        }

        // Обновляем последний PaymentAttempt
        const lastAttempt = await tx.paymentAttempt.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
        });

        if (lastAttempt) {
          await tx.paymentAttempt.update({
            where: { id: lastAttempt.id },
            data: {
              status: PaymentAttemptStatus.SUCCESS,
              providerId: transactionIdStr,
              metadata: dto as unknown as Prisma.InputJsonValue,
            },
          });
        }
      });

      this.logger.log(`Order ${order.id} marked as PAID via Alif callback`);
    } else if (dto.status === 'failed') {
      await this.prisma.$transaction(async (tx) => {
        if (order.paymentStatus !== OrderPaymentStatus.PAID) {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: OrderPaymentStatus.FAILED },
          });

          // Возвращаем остатки на склад при неуспешной оплате
          for (const item of order.items) {
            if (item.productVariantId) {
              await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }

        const lastAttempt = await tx.paymentAttempt.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
        });

        if (lastAttempt) {
          await tx.paymentAttempt.update({
            where: { id: lastAttempt.id },
            data: {
              status: PaymentAttemptStatus.FAILED,
              providerId: transactionIdStr,
              errorMessage: dto.message || 'Payment failed in Alif',
              metadata: dto as unknown as Prisma.InputJsonValue,
            },
          });
        }
      });
    } else if (dto.status === 'canceled') {
      await this.prisma.$transaction(async (tx) => {
        if (order.paymentStatus !== OrderPaymentStatus.PAID) {
          // Возвращаем остатки на склад при отмене оплаты
          for (const item of order.items) {
            if (item.productVariantId) {
              await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus:
              order.paymentStatus === OrderPaymentStatus.PAID
                ? OrderPaymentStatus.REFUNDED
                : OrderPaymentStatus.FAILED,
            cancelReason: dto.message || 'Payment canceled by Alif',
          },
        });

        if (order.transaction) {
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              status: TransactionStatus.REFUNDED,
              metadata: dto as unknown as Prisma.InputJsonValue,
            },
          });
        }

        const lastAttempt = await tx.paymentAttempt.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
        });

        if (lastAttempt) {
          await tx.paymentAttempt.update({
            where: { id: lastAttempt.id },
            data: {
              status: PaymentAttemptStatus.CANCELED,
              providerId: transactionIdStr,
              errorMessage: dto.message || 'Payment canceled',
              metadata: dto as unknown as Prisma.InputJsonValue,
            },
          });
        }
      });
    }

    return { code: 200, message: 'Callback processed successfully' };
  }

  /**
   * Ручная проверка статуса платежа в Alif (/checktxn) и синхронизация в БД
   */
  async checkPaymentStatus(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { transaction: true },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому заказу');
    }

    const alifStatus = await this.alifProvider.checkTransaction(orderId);

    // Если статус в Alif успешен ('ok'), а заказ еще не помечен как оплаченный — синхронизируем
    if (
      alifStatus.status === 'ok' &&
      order.paymentStatus !== OrderPaymentStatus.PAID
    ) {
      const transactionIdStr = alifStatus.transactionId
        ? String(alifStatus.transactionId)
        : null;

      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: OrderPaymentStatus.PAID,
            paidAt: new Date(),
          },
        });

        if (!order.transaction) {
          await tx.transaction.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              amount: order.totalPrice,
              status: TransactionStatus.SUCCESS,
              provider: 'ALIF',
              providerId: transactionIdStr,
              payerPhone: alifStatus.phone || null,
              metadata: alifStatus as unknown as Prisma.InputJsonValue,
            },
          });
        }

        const lastAttempt = await tx.paymentAttempt.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
        });

        if (lastAttempt) {
          await tx.paymentAttempt.update({
            where: { id: lastAttempt.id },
            data: {
              status: PaymentAttemptStatus.SUCCESS,
              providerId: transactionIdStr,
              metadata: alifStatus as unknown as Prisma.InputJsonValue,
            },
          });
        }
      });
    }

    return {
      orderId: order.id,
      localPaymentStatus: order.paymentStatus,
      alifResponse: alifStatus,
    };
  }

  /**
   * Отмена платежа в Alif (/cancel/standard)
   */
  async cancelPayment(dto: CancelPaymentRequest, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { transaction: true },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'У вас нет прав на отмену платежа этого заказа',
      );
    }

    if (!order.transaction || !order.transaction.providerId) {
      throw new ConflictException(
        'У данного заказа нет активной транзакции для отмены',
      );
    }

    if (order.transaction.status !== TransactionStatus.SUCCESS) {
      throw new ConflictException('Транзакция уже отменена или не завершена');
    }

    const cancelResponse = await this.alifProvider.cancelPayment({
      transactionId: order.transaction.providerId,
      amount: order.transaction.amount,
      reason: dto.reason,
    });

    // 200 - успешно, 208 - уже отменено ранее
    if (cancelResponse.code === 200 || cancelResponse.code === 208) {
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: order.transaction!.id },
          data: {
            status: TransactionStatus.REFUNDED,
            metadata: cancelResponse as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: OrderPaymentStatus.REFUNDED,
            cancelReason: dto.reason || 'Отмена платежа через Alif',
          },
        });

        const lastAttempt = await tx.paymentAttempt.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
        });

        if (lastAttempt) {
          await tx.paymentAttempt.update({
            where: { id: lastAttempt.id },
            data: {
              status: PaymentAttemptStatus.REFUNDED,
              metadata: cancelResponse as unknown as Prisma.InputJsonValue,
            },
          });
        }
      });

      return {
        success: true,
        message: cancelResponse.message || 'Платеж успешно отменен',
      };
    }

    throw new BadRequestException(
      cancelResponse.message || 'Не удалось отменить платеж в Alif',
    );
  }

  /**
   * Получить сохраненные карты пользователя (SavedCard)
   */
  async getSavedCards(userId: string) {
    return await this.prisma.savedCard.findMany({
      where: { userId },
      select: {
        id: true,
        cardMask: true,
        cardType: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Удалить сохраненную карту
   */
  async deleteSavedCard(cardId: string, userId: string) {
    const card = await this.prisma.savedCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== userId) {
      throw new NotFoundException('Карта не найдена');
    }

    await this.prisma.savedCard.delete({
      where: { id: cardId },
    });

    return { success: true, message: 'Карта успешно удалена' };
  }

  /**
   * Получить статус оплаты для экрана результата фронтенда (Result Screen)
   */
  async getOrderPaymentStatus(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        paymentMethod: true,
        transaction: true,
        paymentAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому заказу');
    }

    const lastAttempt = order.paymentAttempts[0] || null;

    return {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      totalPrice: order.totalPrice,
      cancelReason: order.cancelReason,
      paymentMethod: {
        id: order.paymentMethod.id,
        name: order.paymentMethod.name,
        code: order.paymentMethod.code,
        type: order.paymentMethod.type,
        provider: order.paymentMethod.provider,
        icon: order.paymentMethod.icon,
      },
      transaction: order.transaction
        ? {
            id: order.transaction.id,
            provider: order.transaction.provider,
            providerId: order.transaction.providerId,
            payerAccount: order.transaction.payerAccount,
            payerPhone: order.transaction.payerPhone,
            paymentGate: order.transaction.paymentGate,
            status: order.transaction.status,
          }
        : null,
      payUrl: lastAttempt?.paymentUrl || null,
      lastAttemptStatus: lastAttempt?.status || null,
      errorMessage: lastAttempt?.errorMessage || null,
    };
  }

  /**
   * Эмуляция callback от Alif для 100% тестирования фронтенда (Sandbox Mock)
   */
  async simulateCallback(
    dto: { orderId: string; status: string },
    userId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'У вас нет прав на тестирование этого заказа',
      );
    }

    const mockTransactionId = String(
      Math.floor(100000 + Math.random() * 900000),
    );
    const mockDataToSign = `${dto.orderId}${dto.status}${mockTransactionId}`;
    const mockToken = this.alifProvider.generateToken(mockDataToSign);

    const mockCallbackPayload: AlifCallbackRequest = {
      orderId: dto.orderId,
      transactionId: mockTransactionId,
      status: dto.status,
      token: mockToken,
      amount: order.totalPrice,
      phone: '992900000000',
      account: '444455******1111',
      transaction_type: 'korti_milli',
      message:
        dto.status === 'ok'
          ? 'Тестовый платеж успешно проведен'
          : dto.status === 'canceled'
            ? 'Тестовый платеж отменен'
            : 'Тестовый платеж отклонен банком',
    };

    const result = await this.handleCallback(mockCallbackPayload);

    const updatedStatus = await this.getOrderPaymentStatus(dto.orderId, userId);

    return {
      message: `Эмуляция со статусом "${dto.status}" успешно выполнена`,
      callbackResult: result,
      orderPaymentStatus: updatedStatus,
    };
  }
}
