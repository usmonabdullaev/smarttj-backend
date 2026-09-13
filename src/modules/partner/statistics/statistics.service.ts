import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { PartnerStatisticsRepository } from '@/common/repositories';
import {
  GetSalesChartDto,
  GetTopProductsDto,
  SalesPeriod,
  TopProductsPeriod,
} from './dto';

/** Статусы, считающиеся "на модерации" */
const MODERATION_STATUSES = [
  ProductStatus.AUTO_MODERATION,
  ProductStatus.MANUAL_MODERATION,
] as const;

/** Статусы, считающиеся "активными в каталоге" */
const ACTIVE_STATUSES = [
  ProductStatus.ACTIVE,
  ProductStatus.NOT_AVAILABLE,
] as const;

/** Статусы, считающиеся "черновиками" */
const DRAFT_STATUSES = [ProductStatus.DRAFT, ProductStatus.INACTIVE] as const;

/** Все видимые статусы (исключая DELETED) */
const ALL_VISIBLE_STATUSES = [
  ...MODERATION_STATUSES,
  ...ACTIVE_STATUSES,
  ...DRAFT_STATUSES,
] as const;

@Injectable()
export class PartnerStatisticsService {
  constructor(
    private readonly partnerStatisticsRepository: PartnerStatisticsRepository,
  ) {}

  /**
   * Числовые карточки для главной страницы:
   * - Карточки выручки (всего, за месяц, сегодня, динамика к прошлому месяцу, средний чек)
   * - Карточки заказов (всего, за месяц, сегодня, в обработке, динамика)
   * - Карточки товаров (всего, активные, на модерации, черновики)
   */
  async cards(partnerId: string) {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const startOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    );
    const endOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const [
      totalProducts,
      activeProducts,
      moderationProducts,
      draftProducts,
      finSummary,
    ] = await Promise.all([
      this.partnerStatisticsRepository.countProducts(partnerId, [
        ...ALL_VISIBLE_STATUSES,
      ] as ProductStatus[]),
      this.partnerStatisticsRepository.countProducts(partnerId, [
        ...ACTIVE_STATUSES,
      ] as ProductStatus[]),
      this.partnerStatisticsRepository.countProducts(partnerId, [
        ...MODERATION_STATUSES,
      ] as ProductStatus[]),
      this.partnerStatisticsRepository.countProducts(partnerId, [
        ...DRAFT_STATUSES,
      ] as ProductStatus[]),
      this.partnerStatisticsRepository.getFinancialAndOrdersSummary(partnerId, {
        startOfToday,
        endOfToday,
        startOfThisMonth,
        endOfThisMonth,
        startOfPrevMonth,
        endOfPrevMonth,
      }),
    ]);

    const totalRevenue = Number(finSummary.total_revenue);
    const monthRevenue = Number(finSummary.month_revenue);
    const prevMonthRevenue = Number(finSummary.prev_month_revenue);
    const todayRevenue = Number(finSummary.today_revenue);

    const totalOrders = Number(finSummary.total_orders);
    const monthOrders = Number(finSummary.month_orders);
    const prevMonthOrders = Number(finSummary.prev_month_orders);
    const todayOrders = Number(finSummary.today_orders);
    const pendingOrders = Number(finSummary.pending_orders);

    const revenueGrowthPercent =
      prevMonthRevenue > 0
        ? Number(
            (
              ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) *
              100
            ).toFixed(1),
          )
        : monthRevenue > 0
          ? 100
          : 0;

    const ordersGrowthPercent =
      prevMonthOrders > 0
        ? Number(
            (((monthOrders - prevMonthOrders) / prevMonthOrders) * 100).toFixed(
              1,
            ),
          )
        : monthOrders > 0
          ? 100
          : 0;

    const averageCheck =
      monthOrders > 0
        ? Math.round(monthRevenue / monthOrders)
        : totalOrders > 0
          ? Math.round(totalRevenue / totalOrders)
          : 0;

    const productsCards = {
      total: {
        count: totalProducts,
        label: 'Всего товаров',
        description: 'В каталоге магазина',
      },
      active: {
        count: activeProducts,
        label: 'Активные в каталоге',
        description: 'Доступны покупателям',
      },
      moderation: {
        count: moderationProducts,
        label: 'На модерации',
        description: 'Ожидают проверки модератором',
      },
      drafts: {
        count: draftProducts,
        label: 'Черновики',
        description: 'Не опубликованы',
      },
    };

    return {
      revenue: {
        total: totalRevenue,
        thisMonth: monthRevenue,
        today: todayRevenue,
        growthPercent: revenueGrowthPercent,
        averageCheck,
      },
      orders: {
        total: totalOrders,
        thisMonth: monthOrders,
        today: todayOrders,
        pending: pendingOrders,
        growthPercent: ordersGrowthPercent,
      },
      products: productsCards,
      // Поля для полной обратной совместимости
      total: productsCards.total,
      active: productsCards.active,
      moderation: productsCards.moderation,
      drafts: productsCards.drafts,
    };
  }

  /**
   * Топ продаваемых товаров партнера.
   */
  async topProducts(partnerId: string, dto: GetTopProductsDto) {
    const { from, to } = this.resolveTopProductsPeriod(dto.period);
    const limit = dto.limit ?? 5;

    const rawProducts = await this.partnerStatisticsRepository.getTopProducts(
      partnerId,
      limit,
      from,
      to,
    );

    return rawProducts.map((p) => ({
      id: p.id,
      title: p.title || 'Без названия',
      slug: p.slug || undefined,
      soldCount: Number(p.sold_count),
      revenue: Number(p.revenue),
      ordersCount: Number(p.orders_count),
      currentStock: Number(p.current_stock),
      averageRating: Number(p.averageRating || 0),
      imageUrl: p.image_url,
      category: p.category_id
        ? {
            id: p.category_id,
            name: p.category_name,
          }
        : undefined,
    }));
  }

  /**
   * Данные для area chart продаж по дням.
   * Если в какой-то день продаж не было — вставляем 0.
   */
  async salesChart(partnerId: string, dto: GetSalesChartDto) {
    const { from, to, days } = this.resolvePeriod(dto.period);

    const [rawRows, totalRevenue, totalSold] = await Promise.all([
      this.partnerStatisticsRepository.dailySales(partnerId, from, to),
      this.partnerStatisticsRepository.sumRevenue(partnerId, from, to),
      this.partnerStatisticsRepository.sumSoldCount(partnerId, from, to),
    ]);

    // Строим карту по дате для быстрого поиска
    const rowMap = new Map(rawRows.map((r) => [r.date, r]));

    // Заполняем все дни периода (0 если нет данных)
    const points: { date: string; revenue: number; sold: number }[] = [];
    const cursor = new Date(from);

    for (let i = 0; i < days; i++) {
      const dateKey = cursor.toISOString().split('T')[0];
      const row = rowMap.get(dateKey);

      points.push({
        date: dateKey,
        revenue: row ? row.revenue : 0,
        sold: row ? row.sold : 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      period: dto.period,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      total: {
        revenue: totalRevenue,
        sold: totalSold,
      },
      points,
    };
  }

  private resolvePeriod(period: SalesPeriod = SalesPeriod.MONTH_1): {
    from: Date;
    to: Date;
    days: number;
  } {
    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    let days: number;

    switch (period) {
      case SalesPeriod.DAYS_7:
        from.setDate(from.getDate() - 6);
        days = 7;
        break;
      case SalesPeriod.MONTH_1:
        from.setDate(from.getDate() - 29);
        days = 30;
        break;
      case SalesPeriod.MONTHS_3:
        from.setDate(from.getDate() - 89);
        days = 90;
        break;
    }

    return { from, to, days };
  }

  private resolveTopProductsPeriod(
    period: TopProductsPeriod = TopProductsPeriod.ALL,
  ): {
    from?: Date;
    to?: Date;
  } {
    if (period === TopProductsPeriod.ALL) {
      return {};
    }

    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    switch (period) {
      case TopProductsPeriod.DAYS_7:
        from.setDate(from.getDate() - 6);
        break;
      case TopProductsPeriod.MONTH_1:
        from.setDate(from.getDate() - 29);
        break;
      case TopProductsPeriod.MONTHS_3:
        from.setDate(from.getDate() - 89);
        break;
    }

    return { from, to };
  }
}
