import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderPaymentStatus,
  PaymentMethodType,
  Prisma,
  TransactionStatus,
} from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { OrderRequest } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async test(dto: OrderRequest, userId: string) {
    // В проде тестовый эндпоинт должен быть недоступен
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Test payment is disabled in production');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { paymentMethod: true, transaction: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Заказ может оплатить только его владелец
    if (order.userId !== userId) {
      throw new ForbiddenException('You are not allowed to pay for this order');
    }

    if (order.paymentMethod.type === PaymentMethodType.CASH) {
      throw new ConflictException(
        'You have selected cash as the payment method',
      );
    }

    // Whitelist разрешённых для оплаты статусов —
    // безопаснее, чем перечислять запрещённые
    const payableStatuses: OrderPaymentStatus[] = [OrderPaymentStatus.UNPAID];

    if (!payableStatuses.includes(order.paymentStatus)) {
      throw new ConflictException(
        `Cannot pay for order in status ${order.paymentStatus}`,
      );
    }

    // Быстрая предварительная проверка (не защищает от race condition,
    // но даёт понятную ошибку в обычном случае)
    if (order.transaction) {
      // Add validation for failed payments
      throw new ConflictException('Transaction for this order already exists');
    }

    if (!order.totalPrice || order.totalPrice <= 0) {
      throw new BadRequestException('Invalid order amount');
    }

    try {
      // Создание транзакции и обновление статуса заказа — атомарно
      const [transaction] = await this.prisma.$transaction([
        this.prisma.transaction.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            amount: order.totalPrice,
            status: TransactionStatus.SUCCESS,
            providerId: 'TEST',
          },
        }),
        this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: OrderPaymentStatus.PAID },
        }),
      ]);

      return transaction;
    } catch (e) {
      // Уникальность orderId в Transaction ловит race condition,
      // если два запроса пришли параллельно
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Transaction for this order already exists',
        );
      }
      throw e;
    }
  }
}
