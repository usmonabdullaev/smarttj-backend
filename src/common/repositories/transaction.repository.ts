import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async aggregate(args: Prisma.TransactionAggregateArgs) {
    return await this.prisma.transaction.aggregate(args);
  }
}
