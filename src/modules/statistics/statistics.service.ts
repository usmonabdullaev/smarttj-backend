import { OrderUIStatus, TransactionPaymentStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async cards() {
    // Income
    const now = new Date();

    const startCurrent = new Date();
    startCurrent.setDate(now.getDate() - 30);

    const startPrev = new Date();
    startPrev.setDate(now.getDate() - 60);

    const endPrev = new Date(startCurrent);

    const [
      currentIncomeTransaction,
      previousIncomeTransaction,
      totalIncomeTransaction,
    ] = await Promise.all([
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
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: TransactionPaymentStatus.SUCCESS },
      }),
    ]);

    const currentIncome = +(currentIncomeTransaction._sum.amount || 0);
    const previousIncome = +(previousIncomeTransaction._sum.amount || 0);
    const incomeTotal = +(totalIncomeTransaction._sum.amount || 0);

    let incomeGrowth = 0;

    if (previousIncome === 0) {
      incomeGrowth = currentIncome > 0 ? 100 : 0;
    } else {
      incomeGrowth = ((currentIncome - previousIncome) / previousIncome) * 100;
    }
    // /Income

    // Orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      currentOrdersCount,
      previousOrdersCount,
      totalOrdersCount,
      todayOrdersCount,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: { gte: startCurrent, lt: now },
          uiStatus: {
            in: [OrderUIStatus.SHOW, OrderUIStatus.ARCHIVED],
          },
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: startPrev, lt: endPrev },
          uiStatus: {
            in: [OrderUIStatus.SHOW, OrderUIStatus.ARCHIVED],
          },
        },
      }),
      this.prisma.order.count({
        where: {
          uiStatus: {
            in: [OrderUIStatus.SHOW, OrderUIStatus.ARCHIVED],
          },
        },
      }),
      this.prisma.order.count({
        where: {
          uiStatus: {
            in: [OrderUIStatus.SHOW, OrderUIStatus.ARCHIVED],
          },
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
    ]);

    let ordersGrowth = 0;

    if (previousOrdersCount === 0) {
      ordersGrowth = currentOrdersCount > 0 ? 100 : 0;
    } else {
      ordersGrowth =
        ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) *
        100;
    }
    // /Orders

    return {
      income: {
        growth: Number(incomeGrowth.toFixed(2)),
        difference: currentIncome - previousIncome,
        total: incomeTotal,
        lastMonth: currentIncome,
      },
      order: {
        growth: Number(ordersGrowth.toFixed(2)),
        difference: currentOrdersCount - previousOrdersCount,
        total: totalOrdersCount,
        lastMonth: currentOrdersCount,
        today: todayOrdersCount,
      },
    };
  }
}
