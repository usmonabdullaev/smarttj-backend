import { Injectable } from '@nestjs/common';
import { TransactionPaymentStatus } from '@prisma/client';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const now = new Date();

    const startCurrent = new Date();
    startCurrent.setDate(now.getDate() - 30);

    const startPrev = new Date();
    startPrev.setDate(now.getDate() - 60);

    const endPrev = new Date(startCurrent);

    const [current, previous] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          status: TransactionPaymentStatus.SUCCESS,
          createdAt: { gte: startCurrent, lt: now },
        },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          status: TransactionPaymentStatus.SUCCESS,
          createdAt: { gte: startPrev, lt: endPrev },
        },
      }),
    ]);

    const currentIncome = current._sum.amount || 0;
    const previousIncome = previous._sum.amount || 0;

    let growth = 0;

    if (previousIncome === 0) {
      growth = +currentIncome > 0 ? 100 : 0;
    } else {
      growth = ((+currentIncome - +previousIncome) / +previousIncome) * 100;
    }

    return {
      currentIncome,
      previousIncome,
      difference: +currentIncome - +previousIncome,
      growth: Number(growth.toFixed(2)),
    };
  }
}
