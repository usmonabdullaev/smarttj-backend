import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  aggregate(args: Prisma.TransactionAggregateArgs) {
    return this.prisma.transaction.aggregate(args);
  }
}
