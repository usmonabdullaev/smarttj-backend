import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderPaymentStatus, Prisma, TransactionStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  GetAdminPaymentAttemptsDto,
  GetAdminTransactionsDto,
  RefundAdminTransactionDto,
} from './dto';

const TRANSACTION_USER_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  avatar: true,
} as const;

@Injectable()
export class AdminTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(query: GetAdminTransactionsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.provider && { provider: query.provider }),
      ...(query.paymentGate && { paymentGate: query.paymentGate }),
      ...(query.userId && { userId: query.userId }),
      ...(query.orderId && { orderId: query.orderId }),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { id: { contains: query.q, mode: 'insensitive' } },
              { orderId: { contains: query.q, mode: 'insensitive' } },
              { providerId: { contains: query.q, mode: 'insensitive' } },
              { payerAccount: { contains: query.q, mode: 'insensitive' } },
              { payerPhone: { contains: query.q } },
              {
                user: {
                  OR: [
                    { name: { contains: query.q, mode: 'insensitive' } },
                    { phone: { contains: query.q } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: TRANSACTION_USER_SELECT },
          order: {
            select: {
              id: true,
              totalPrice: true,
              paymentStatus: true,
              deliveryStatus: true,
              type: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: TRANSACTION_USER_SELECT },
        order: {
          include: {
            paymentMethod: true,
            address: true,
            items: {
              include: {
                partner: { select: { id: true, title: true } },
                productVariant: {
                  select: {
                    id: true,
                    product: { select: { id: true, title: true, slug: true } },
                  },
                },
              },
            },
            paymentAttempts: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException({
        message: 'Транзакция не найдена',
        code: 'TRANSACTION_NOT_FOUND',
        error: id,
      });
    }

    return transaction;
  }

  async getSummary() {
    const [successAgg, refundAgg, successCount, refundCount] =
      await Promise.all([
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: TransactionStatus.SUCCESS },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: TransactionStatus.REFUNDED },
        }),
        this.prisma.transaction.count({
          where: { status: TransactionStatus.SUCCESS },
        }),
        this.prisma.transaction.count({
          where: { status: TransactionStatus.REFUNDED },
        }),
      ]);

    return {
      totalSuccessAmount: +(successAgg._sum.amount || 0),
      totalRefundedAmount: +(refundAgg._sum.amount || 0),
      successCount,
      refundedCount: refundCount,
    };
  }

  async getPaymentAttempts(query: GetAdminPaymentAttemptsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentAttemptWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.orderId && { orderId: query.orderId }),
      ...(query.userId && { userId: query.userId }),
      ...(query.q
        ? {
            OR: [
              { errorMessage: { contains: query.q, mode: 'insensitive' } },
              { providerId: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.paymentAttempt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: TRANSACTION_USER_SELECT },
          order: {
            select: {
              id: true,
              totalPrice: true,
              paymentStatus: true,
            },
          },
        },
      }),
      this.prisma.paymentAttempt.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async refund(id: string, dto: RefundAdminTransactionDto) {
    const transaction = await this.getById(id);

    if (transaction.status === TransactionStatus.REFUNDED) {
      throw new BadRequestException({
        message: 'Транзакция уже была возвращена ранее',
        code: 'TRANSACTION_ALREADY_REFUNDED',
        error: id,
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.REFUNDED,
          metadata: {
            ...((transaction.metadata as Record<string, any>) || {}),
            refundReason: dto.reason,
            refundedAt: new Date().toISOString(),
          },
        },
      });

      await tx.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: OrderPaymentStatus.REFUNDED,
        },
      });

      return {
        success: true,
        message: 'Транзакция успешно переведена в статус возврата (REFUNDED)',
        transaction: updatedTx,
      };
    });
  }
}
