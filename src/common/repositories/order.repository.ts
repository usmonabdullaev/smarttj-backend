import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async count(where: Prisma.OrderWhereInput) {
    return await this.prisma.order.count({ where });
  }
}
