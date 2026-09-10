import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderDeliveryStatus,
  OrderItemDeliveryStatus,
  Prisma,
} from '@prisma/client';

import { NotificationTelegramService } from '@/bullmq/notification-telegram/notification-telegram.service';
import { ConnectTelegramDto, UpdateTelegramOrderStatusDto } from './dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { TelegramCodeStore } from './telegram-code.store';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class TelegramService {
  private readonly logger = new LoggerService(TelegramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly codeStore: TelegramCodeStore,
    private readonly notificationTelegram: NotificationTelegramService,
  ) {}

  /**
   * Получить профиль партнёра по Telegram ID
   */
  async getProfile(telegramId: string) {
    const user = await this.prisma.user.findFirst({
      where: { telegramId },
      include: {
        partner: true,
      },
    });

    if (!user || !user.partner) {
      throw new NotFoundException({
        message: 'Partner profile not found for this telegramId',
        code: 'PARTNER_NOT_FOUND',
        error: telegramId,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Привязать Telegram ID к партнёру по одноразовому коду
   */
  async connect(dto: ConnectTelegramDto) {
    const payload = await this.codeStore.consumeLinkCode(dto.code);

    if (!payload) {
      throw new BadRequestException({
        message: 'Invalid or expired linking code',
        code: 'INVALID_OR_EXPIRED_CODE',
      });
    }

    const partner = await this.prisma.partner.findUnique({
      where: { id: payload.partnerId },
      include: { user: true },
    });

    if (!partner) {
      throw new NotFoundException({
        message: 'Partner not found',
        code: 'PARTNER_NOT_FOUND',
      });
    }

    // Отвязываем этот telegramId у других аккаунтов, если был привязан
    await this.prisma.user.updateMany({
      where: {
        telegramId: dto.telegramId,
        id: { not: partner.userId },
      },
      data: { telegramId: null },
    });

    // Привязываем к текущему пользователю-партнёру
    const updatedUser = await this.prisma.user.update({
      where: { id: partner.userId },
      data: { telegramId: dto.telegramId },
    });

    this.logger.log(
      `Partner ${partner.id} (${partner.title}) successfully connected Telegram ${dto.telegramId}`,
    );

    return {
      success: true,
      message: 'Telegram successfully connected',
      partner: {
        id: partner.id,
        title: partner.title,
        phone1: partner.phone1,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          telegramId: updatedUser.telegramId,
        },
      },
    };
  }

  /**
   * Отвязать Telegram ID
   */
  async disconnect(telegramId: string) {
    const user = await this.prisma.user.findFirst({
      where: { telegramId },
      include: { partner: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User with this telegramId not found',
        code: 'USER_NOT_FOUND',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { telegramId: null },
    });

    this.logger.log(`Telegram ${telegramId} disconnected from user ${user.id}`);

    return {
      success: true,
      message: 'Telegram disconnected successfully',
    };
  }

  /**
   * Получить список заказов партнёра для Telegram-бота
   */
  async getPartnerOrders(
    telegramId: string,
    limit: number = 5,
    status?: OrderDeliveryStatus,
  ) {
    const user = await this.getProfile(telegramId);
    const partnerId = user.partner!.id;

    const where: Prisma.OrderWhereInput = {
      items: {
        some: {
          productVariant: {
            product: { partnerId },
          },
        },
      },
      ...(status && { deliveryStatus: status }),
    };

    const orders = await this.prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        address: true,
        paymentMethod: true,
        items: {
          where: {
            productVariant: {
              product: { partnerId },
            },
          },
          include: {
            productVariant: {
              include: {
                product: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
      },
    });

    return orders.map((o) => {
      const partnerTotal = o.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      return {
        id: o.id,
        createdAt: o.createdAt,
        deliveryStatus: o.deliveryStatus,
        paymentStatus: o.paymentStatus,
        type: o.type,
        partnerTotal,
        customerName: o.user?.name,
        customerPhone: o.user?.phone,
        address: o.address?.address,
        itemsCount: o.items.length,
        items: o.items.map((i) => ({
          id: i.id,
          title: i.productVariant?.product?.title,
          quantity: i.quantity,
          price: i.price,
          deliveryStatus: i.deliveryStatus,
        })),
      };
    });
  }

  /**
   * Получить детальную информацию о заказе по Telegram ID
   */
  async getPartnerOrderDetails(telegramId: string, orderId: string) {
    const user = await this.getProfile(telegramId);
    const partnerId = user.partner!.id;

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            productVariant: {
              product: { partnerId },
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        address: true,
        paymentMethod: true,
        items: {
          where: {
            productVariant: {
              product: { partnerId },
            },
          },
          include: {
            productVariant: {
              include: {
                product: {
                  select: { id: true, title: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found for this partner',
        code: 'ORDER_NOT_FOUND',
      });
    }

    const partnerTotal = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    return {
      ...order,
      partnerTotal,
    };
  }

  /**
   * Обновить статус доставки товаров партнёра в заказе из бота
   */
  async updatePartnerOrderStatus(
    telegramId: string,
    orderId: string,
    dto: UpdateTelegramOrderStatusDto,
  ) {
    const user = await this.getProfile(telegramId);
    const partnerId = user.partner!.id;

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            productVariant: {
              product: { partnerId },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found for this partner',
        code: 'ORDER_NOT_FOUND',
      });
    }

    const receivedAt =
      dto.deliveryStatus === OrderItemDeliveryStatus.RECEIVED
        ? new Date()
        : undefined;

    await this.prisma.orderItem.updateMany({
      where: {
        orderId,
        productVariant: {
          product: { partnerId },
        },
      },
      data: {
        deliveryStatus: dto.deliveryStatus,
        ...(receivedAt !== undefined && { receivedAt }),
      },
    });

    // Синхронизируем общий статус заказа
    const allItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      select: { deliveryStatus: true },
    });

    if (allItems.length > 0) {
      let newOrderStatus: OrderDeliveryStatus = OrderDeliveryStatus.NEW;

      const allReceived = allItems.every(
        (i) => i.deliveryStatus === OrderItemDeliveryStatus.RECEIVED,
      );
      const allDeliveredOrReceived = allItems.every(
        (i) =>
          i.deliveryStatus === OrderItemDeliveryStatus.DELIVERED ||
          i.deliveryStatus === OrderItemDeliveryStatus.RECEIVED,
      );
      const someDeliveredOrReceived = allItems.some(
        (i) =>
          i.deliveryStatus === OrderItemDeliveryStatus.DELIVERED ||
          i.deliveryStatus === OrderItemDeliveryStatus.RECEIVED ||
          i.deliveryStatus === OrderItemDeliveryStatus.AT_PICKUP_POINT,
      );
      const allReturned = allItems.every(
        (i) => i.deliveryStatus === OrderItemDeliveryStatus.RETURNED,
      );

      if (allReceived) {
        newOrderStatus = OrderDeliveryStatus.RECEIVED;
      } else if (allDeliveredOrReceived) {
        newOrderStatus = OrderDeliveryStatus.DELIVERED;
      } else if (someDeliveredOrReceived) {
        newOrderStatus = OrderDeliveryStatus.PARTIALLY_DELIVERED;
      } else if (allReturned) {
        newOrderStatus = OrderDeliveryStatus.RETURNED;
      }

      await this.prisma.order.update({
        where: { id: orderId },
        data: { deliveryStatus: newOrderStatus },
      });
    }

    return await this.getPartnerOrderDetails(telegramId, orderId);
  }

  /**
   * Отправить уведомление партнёрам в Telegram о новом заказе
   */
  async notifyPartnersAboutNewOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { name: true, phone: true },
        },
        address: true,
        paymentMethod: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    partner: {
                      include: {
                        user: {
                          select: { id: true, telegramId: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order || !order.items.length) {
      return;
    }

    // Группируем позиции заказа по партнёрам
    const partnerGroups = new Map<
      string,
      {
        partnerTitle: string;
        telegramId?: string;
        items: Array<{ title: string; quantity: number; price: number }>;
      }
    >();

    for (const item of order.items) {
      const partner = item.productVariant?.product?.partner;
      if (!partner) continue;

      const partnerId = partner.id;
      if (!partnerGroups.has(partnerId)) {
        partnerGroups.set(partnerId, {
          partnerTitle: partner.title,
          telegramId: partner.user?.telegramId || undefined,
          items: [],
        });
      }

      partnerGroups.get(partnerId)!.items.push({
        title: item.productVariant?.product?.title || 'Товар',
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Отправляем каждому партнёру, у которого подключен Telegram
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, group] of partnerGroups.entries()) {
      if (!group.telegramId) {
        continue;
      }

      const partnerTotal = group.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );

      const shortOrderId = order.id.slice(0, 8);
      const orderTypeLabel =
        order.type === 'DELIVERY' ? '🚚 Доставка' : '🏬 Самовывоз';
      const addressText = order.address?.address || 'Не указан';
      const customerName = order.user?.name || 'Покупатель';
      const customerPhone = order.user?.phone || 'Не указан';

      const itemsList = group.items
        .map(
          (i, idx) =>
            `${idx + 1}. <b>${this.escapeHtml(i.title)}</b> — ${i.quantity} шт. × ${i.price} TJS`,
        )
        .join('\n');

      const messageText =
        `🛒 <b>Новый заказ #${shortOrderId}</b>\n\n` +
        `Товары вашего магазина (<b>${this.escapeHtml(group.partnerTitle)}</b>):\n` +
        `${itemsList}\n\n` +
        `💰 <b>Итого к оплате:</b> ${partnerTotal} TJS\n` +
        `Способ оплаты: <i>${this.escapeHtml(order.paymentMethod?.name || 'Стандартный')}</i>\n` +
        `${orderTypeLabel}: <code>${this.escapeHtml(addressText)}</code>\n` +
        `👤 Клиент: ${this.escapeHtml(customerName)} (<code>${this.escapeHtml(customerPhone)}</code>)\n` +
        (order.comment
          ? `📝 Примечание: <i>${this.escapeHtml(order.comment)}</i>\n`
          : '') +
        `\n⏱ <i>Заказ ожидает обработки!</i>`;

      await this.notificationTelegram.send({
        telegramId: group.telegramId,
        message: messageText,
      });
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
