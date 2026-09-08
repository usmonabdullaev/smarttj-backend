import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { PartnerStatisticsRepository } from '@/common/repositories';
import { GetSalesChartDto, SalesPeriod } from './dto/get-sales-chart.dto';

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
   * - Всего товаров
   * - Активные в каталоге (ACTIVE + NOT_AVAILABLE)
   * - На модерации (AUTO_MODERATION + MANUAL_MODERATION)
   * - Черновики (DRAFT + INACTIVE)
   */
  async cards(partnerId: string) {
    const [total, active, moderation, drafts] = await Promise.all([
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
    ]);

    return {
      total: {
        count: total,
        label: 'Всего товаров',
        description: 'В каталоге магазина',
      },
      active: {
        count: active,
        label: 'Активные в каталоге',
        description: 'Доступны покупателям',
      },
      moderation: {
        count: moderation,
        label: 'На модерации',
        description: 'Ожидают проверки модератором',
      },
      drafts: {
        count: drafts,
        label: 'Черновики',
        description: 'Не опубликованы',
      },
    };
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
        revenue: +(totalRevenue._sum.price || 0),
        sold: +(totalSold._sum.quantity || 0),
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
}
