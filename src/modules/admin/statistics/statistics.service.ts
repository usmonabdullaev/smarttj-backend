import { Injectable } from '@nestjs/common';
import {
  OrderPaymentStatus,
  PartnerStatus,
  Prisma,
  ProductStatus,
  UserRole,
} from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  AdminChartPointDto,
  AdminOrderHeatmapCellDto,
  AdminStatisticsPeriod,
  AdminStatisticsResponseDto,
  GetAdminStatisticsQueryDto,
} from './dto';

const DAY_NAMES: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
};

@Injectable()
export class AdminStatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(
    query: GetAdminStatisticsQueryDto,
  ): Promise<AdminStatisticsResponseDto> {
    const { from, to, prevFrom, prevTo, days } = this.resolvePeriod(
      query.period,
    );

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Выполняем запросы параллельно для максимальной производительности
    const [
      // Revenue
      totalRevenueAgg,
      currentRevenueAgg,
      prevRevenueAgg,
      // Orders
      totalOrdersCount,
      currentOrdersCount,
      prevOrdersCount,
      todayOrdersCount,
      currentPaidOrdersCount,
      prevPaidOrdersCount,
      // Users
      totalUsersCount,
      currentUsersCount,
      prevUsersCount,
      activeWeeklyUsersRaw,
      // Partners
      partnersCounts,
      // Products
      productsCounts,
      // Charts
      trendRaw,
      heatmapRaw,
      categoriesRaw,
      topProductsRaw,
      topPartnersRaw,
      paymentStatusesGroup,
      deliveryStatusesGroup,
    ] = await Promise.all([
      // 1. Выручка всего (оплаченные заказы)
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: OrderPaymentStatus.PAID },
      }),
      // Выручка за текущий период
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: OrderPaymentStatus.PAID,
          createdAt: { gte: from, lte: to },
        },
      }),
      // Выручка за предшествующий период
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: OrderPaymentStatus.PAID,
          createdAt: { gte: prevFrom, lte: prevTo },
        },
      }),

      // 2. Заказы
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: prevFrom, lte: prevTo } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday, lte: endOfToday } },
      }),
      // Оплаченные заказы за текущий и прошлый период (для среднего чека)
      this.prisma.order.count({
        where: {
          paymentStatus: OrderPaymentStatus.PAID,
          createdAt: { gte: from, lte: to },
        },
      }),
      this.prisma.order.count({
        where: {
          paymentStatus: OrderPaymentStatus.PAID,
          createdAt: { gte: prevFrom, lte: prevTo },
        },
      }),

      // 3. Пользователи (покупатели)
      this.prisma.user.count({ where: { role: UserRole.USER } }),
      this.prisma.user.count({
        where: {
          role: UserRole.USER,
          createdAt: { gte: from, lte: to },
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.USER,
          createdAt: { gte: prevFrom, lte: prevTo },
        },
      }),
      // Активные пользователи за 7 дней (по сессиям)
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT s."userId") AS count
        FROM "Session" s
        JOIN "User" u ON u.id = s."userId"
        WHERE s."isActive" = true
          AND s."expiresAt" > NOW()
          AND s."lastActiveAt" >= NOW() - INTERVAL '7 days'
          AND u."role" = 'USER'
      `,

      // 4. Партнеры
      Promise.all([
        this.prisma.partner.count(),
        this.prisma.partner.count({ where: { status: PartnerStatus.ACTIVE } }),
        this.prisma.partner.count({
          where: { status: PartnerStatus.IN_MODERATE },
        }),
      ]),

      // 5. Товары
      Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({
          where: {
            status: { in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE] },
          },
        }),
        this.prisma.product.count({
          where: {
            status: {
              in: [
                ProductStatus.AUTO_MODERATION,
                ProductStatus.MANUAL_MODERATION,
              ],
            },
          },
        }),
        this.prisma.product.count({
          where: {
            status: { in: [ProductStatus.DRAFT, ProductStatus.INACTIVE] },
          },
        }),
      ]),

      // 6. Данные тренда по дням
      this.prisma.$queryRaw<
        {
          date: string;
          revenue: number;
          orders_count: number;
          paid_orders_count: number;
        }[]
      >(Prisma.sql`
        SELECT
          DATE("o"."createdAt")::text                                                                AS date,
          COALESCE(SUM(CASE WHEN "o"."paymentStatus" = 'PAID' THEN "o"."totalPrice" ELSE 0 END), 0)::float AS revenue,
          COUNT("o".id)::int                                                                        AS orders_count,
          COALESCE(SUM(CASE WHEN "o"."paymentStatus" = 'PAID' THEN 1 ELSE 0 END), 0)::int           AS paid_orders_count
        FROM "Order" o
        WHERE "o"."createdAt" >= ${from} AND "o"."createdAt" <= ${to}
        GROUP BY DATE("o"."createdAt")
        ORDER BY DATE("o"."createdAt") ASC
      `),

      // 7. Heatmap (день недели × час суток)
      this.prisma.$queryRaw<
        {
          day_of_week: number;
          hour: number;
          count: number;
        }[]
      >(Prisma.sql`
        SELECT
          EXTRACT(ISODOW FROM "createdAt")::int AS day_of_week,
          EXTRACT(HOUR FROM "createdAt")::int   AS hour,
          COUNT(id)::int                        AS count
        FROM "Order"
        WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        GROUP BY day_of_week, hour
        ORDER BY day_of_week, hour
      `),

      // 8. Продажи по категориям (Donut Chart)
      this.prisma.$queryRaw<
        {
          id: string;
          name: string;
          slug: string;
          revenue: number;
          items_sold: number;
        }[]
      >(Prisma.sql`
        SELECT
          c.id,
          c.name,
          c.slug,
          COALESCE(SUM(oi.price * oi.quantity), 0)::float AS revenue,
          COALESCE(SUM(oi.quantity), 0)::int             AS items_sold
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        JOIN "Product" p ON p.id = pv."productId"
        JOIN "Category" c ON c.id = p."categoryId"
        WHERE o."createdAt" >= ${from} AND o."createdAt" <= ${to}
          AND o."paymentStatus" = 'PAID'
        GROUP BY c.id, c.name, c.slug
        ORDER BY revenue DESC
        LIMIT 8
      `),

      // 9. Топ-5 продаваемых товаров
      this.prisma.$queryRaw<
        {
          id: string;
          title: string;
          slug: string | null;
          sold_count: number;
          revenue: number;
        }[]
      >(Prisma.sql`
        SELECT
          p.id,
          p.title,
          p.slug,
          COALESCE(SUM(oi.quantity), 0)::int             AS sold_count,
          COALESCE(SUM(oi.price * oi.quantity), 0)::float AS revenue
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        JOIN "Product" p ON p.id = pv."productId"
        WHERE o."createdAt" >= ${from} AND o."createdAt" <= ${to}
          AND o."paymentStatus" = 'PAID'
        GROUP BY p.id, p.title, p.slug
        ORDER BY sold_count DESC
        LIMIT 5
      `),

      // 10. Топ-5 партнеров по выручке
      this.prisma.$queryRaw<
        {
          id: string;
          title: string;
          revenue: number;
          orders_count: number;
        }[]
      >(Prisma.sql`
        SELECT
          pt.id,
          pt.title,
          COALESCE(SUM(oi.price * oi.quantity), 0)::float AS revenue,
          COUNT(DISTINCT oi."orderId")::int              AS orders_count
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        JOIN "Product" p ON p.id = pv."productId"
        JOIN "Partner" pt ON (pt.id = oi."partnerId" OR pt.id = p."partnerId")
        WHERE o."createdAt" >= ${from} AND o."createdAt" <= ${to}
          AND o."paymentStatus" = 'PAID'
        GROUP BY pt.id, pt.title
        ORDER BY revenue DESC
        LIMIT 5
      `),

      // 11. Распределение статусов заказов
      this.prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { id: true },
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.order.groupBy({
        by: ['deliveryStatus'],
        _count: { id: true },
        where: { createdAt: { gte: from, lte: to } },
      }),
    ]);

    // --- Обработка KPI ---
    const totalRevenue = +(totalRevenueAgg._sum.totalPrice || 0);
    const currentRevenue = +(currentRevenueAgg._sum.totalPrice || 0);
    const prevRevenue = +(prevRevenueAgg._sum.totalPrice || 0);

    const currentAvgCheck =
      currentPaidOrdersCount > 0
        ? Number((currentRevenue / currentPaidOrdersCount).toFixed(2))
        : 0;
    const prevAvgCheck =
      prevPaidOrdersCount > 0
        ? Number((prevRevenue / prevPaidOrdersCount).toFixed(2))
        : 0;

    const totalPartners = partnersCounts[0];
    const activePartners = partnersCounts[1];
    const inModeratePartners = partnersCounts[2];

    const totalProducts = productsCounts[0];
    const activeProducts = productsCounts[1];
    const moderationProducts = productsCounts[2];
    const draftProducts = productsCounts[3];

    const activeWeeklyUsers = Number(activeWeeklyUsersRaw[0]?.count || 0);

    // --- Построение Trend Points (без пропусков дней) ---
    const trendMap = new Map(trendRaw.map((r) => [r.date, r]));
    const trend: AdminChartPointDto[] = [];
    const dateCursor = new Date(from);

    for (let i = 0; i < days; i++) {
      const dateKey = dateCursor.toISOString().split('T')[0];
      const row = trendMap.get(dateKey);

      const rev = row ? Number(row.revenue) : 0;
      const totalOrders = row ? Number(row.orders_count) : 0;
      const paidOrders = row ? Number(row.paid_orders_count) : 0;
      const avg = paidOrders > 0 ? Number((rev / paidOrders).toFixed(2)) : 0;

      trend.push({
        date: dateKey,
        revenue: rev,
        ordersCount: totalOrders,
        paidOrdersCount: paidOrders,
        averageCheck: avg,
      });

      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    // --- Построение Heatmap (7 дней недели × 24 часа = 168 ячеек) ---
    const heatmapMap = new Map<string, number>();
    for (const h of heatmapRaw) {
      heatmapMap.set(`${h.day_of_week}-${h.hour}`, Number(h.count));
    }

    const heatmap: AdminOrderHeatmapCellDto[] = [];
    for (let day = 1; day <= 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const count = heatmapMap.get(`${day}-${hour}`) || 0;
        heatmap.push({
          dayOfWeek: day,
          dayName: DAY_NAMES[day] || `${day}`,
          hour,
          count,
        });
      }
    }

    // --- Категории (расчет процента) ---
    const categoryTotalRevenue = categoriesRaw.reduce(
      (sum, c) => sum + Number(c.revenue),
      0,
    );
    const categories = categoriesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      revenue: Number(c.revenue),
      itemsSold: Number(c.items_sold),
      percentage:
        categoryTotalRevenue > 0
          ? Number(
              ((Number(c.revenue) / categoryTotalRevenue) * 100).toFixed(1),
            )
          : 0,
    }));

    // --- Топ-5 товаров ---
    const topProducts = topProductsRaw.map((p) => ({
      id: p.id,
      title: p.title || 'Без названия',
      slug: p.slug || undefined,
      soldCount: Number(p.sold_count),
      revenue: Number(p.revenue),
    }));

    // --- Топ-5 партнеров ---
    const topPartners = topPartnersRaw.map((p) => ({
      id: p.id,
      title: p.title,
      revenue: Number(p.revenue),
      ordersCount: Number(p.orders_count),
    }));

    // --- Статусы ---
    const paymentStatuses = paymentStatusesGroup.map((g) => ({
      status: g.paymentStatus,
      count: g._count.id,
    }));

    const deliveryStatuses = deliveryStatusesGroup.map((g) => ({
      status: g.deliveryStatus,
      count: g._count.id,
    }));

    return {
      period: query.period,
      from: from.toISOString(),
      to: to.toISOString(),
      kpi: {
        revenue: {
          total: totalRevenue,
          current: currentRevenue,
          previous: prevRevenue,
          difference: currentRevenue - prevRevenue,
          growth: this.calculateGrowth(currentRevenue, prevRevenue),
        },
        orders: {
          total: totalOrdersCount,
          current: currentOrdersCount,
          previous: prevOrdersCount,
          difference: currentOrdersCount - prevOrdersCount,
          growth: this.calculateGrowth(currentOrdersCount, prevOrdersCount),
          today: todayOrdersCount,
        },
        averageCheck: {
          total:
            totalOrdersCount > 0
              ? Number((totalRevenue / totalOrdersCount).toFixed(2))
              : 0,
          current: currentAvgCheck,
          previous: prevAvgCheck,
          difference: Number((currentAvgCheck - prevAvgCheck).toFixed(2)),
          growth: this.calculateGrowth(currentAvgCheck, prevAvgCheck),
        },
        users: {
          total: totalUsersCount,
          current: currentUsersCount,
          previous: prevUsersCount,
          difference: currentUsersCount - prevUsersCount,
          growth: this.calculateGrowth(currentUsersCount, prevUsersCount),
          activeWeekly: activeWeeklyUsers,
        },
        partners: {
          total: totalPartners,
          active: activePartners,
          inModerate: inModeratePartners,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          moderation: moderationProducts,
          drafts: draftProducts,
        },
      },
      trend,
      heatmap,
      categories,
      topProducts,
      topPartners,
      paymentStatuses,
      deliveryStatuses,
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private resolvePeriod(
    period: AdminStatisticsPeriod = AdminStatisticsPeriod.DAYS_30,
  ) {
    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    let days = 30;

    switch (period) {
      case AdminStatisticsPeriod.DAYS_7:
        from.setDate(from.getDate() - 6);
        days = 7;
        break;
      case AdminStatisticsPeriod.DAYS_30:
        from.setDate(from.getDate() - 29);
        days = 30;
        break;
      case AdminStatisticsPeriod.DAYS_90:
        from.setDate(from.getDate() - 89);
        days = 90;
        break;
      case AdminStatisticsPeriod.YEAR:
        from.setDate(from.getDate() - 364);
        days = 365;
        break;
    }

    const prevTo = new Date(from);
    prevTo.setMilliseconds(prevTo.getMilliseconds() - 1);

    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - (days - 1));
    prevFrom.setHours(0, 0, 0, 0);

    return { from, to, prevFrom, prevTo, days };
  }
}
