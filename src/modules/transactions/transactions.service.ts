import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateRequest } from './dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequest) {
    return await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        orderId: dto.orderId,
        amount: dto.amount,
        status: dto.status,
        provider: dto.provider,
        providerId: dto.providerId,
      },
    });
  }

  async refund(id: string) {
    return await this.prisma.transaction.update({
      where: { id },
      data: { status: TransactionStatus.REFUNDED },
    });
  }
}
