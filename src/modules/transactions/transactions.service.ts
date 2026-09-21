import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateRequest } from './dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequest) {
    const commissionRate = dto.commissionRate ?? 0;
    const commissionAmount =
      dto.commissionAmount !== undefined
        ? dto.commissionAmount
        : Math.round((dto.amount * commissionRate) / 100);
    const netAmount =
      dto.netAmount !== undefined
        ? dto.netAmount
        : dto.amount - commissionAmount;

    return await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        orderId: dto.orderId,
        amount: dto.amount,
        commissionRate,
        commissionAmount,
        netAmount,
        status: dto.status,
        provider: dto.provider,
        providerId: dto.providerId,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              totalPrice: true,
              paymentStatus: true,
              deliveryStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
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

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            paymentMethod: true,
          },
        },
      },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
