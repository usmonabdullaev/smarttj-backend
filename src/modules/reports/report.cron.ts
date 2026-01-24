import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TransactionPaymentStatus } from '@prisma/client';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ReportCron {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 1 * *')
  async generateReport() {
    const now = new Date();

    let year = now.getUTCFullYear();
    let month = now.getUTCMonth(); // Previous month

    if (month === 0) {
      // январь -> декабрь прошлого года
      month = 12;
      year -= 1;
    }

    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));

    const ordersCount = await this.prisma.order.count({
      where: {
        createdAt: { gte: from, lt: to },
      },
    });

    const revenueAgg = await this.prisma.transaction.aggregate({
      where: {
        createdAt: { gte: from, lt: to },
        status: TransactionPaymentStatus.SUCCESS,
      },
      _sum: { amount: true },
    });

    const revenue = revenueAgg._sum.amount ?? 0;
    const avgOrderValue = ordersCount > 0 ? +revenue / ordersCount : 0;

    await this.prisma.report.upsert({
      where: {
        year_month: {
          year,
          month,
        },
      },
      create: {
        year,
        month,
        ordersCount,
        revenue,
        avgOrderValue,
        paidOrdersCount: ordersCount,
        refundedAmount: 0,
      },
      update: {},
    });
  }
}
