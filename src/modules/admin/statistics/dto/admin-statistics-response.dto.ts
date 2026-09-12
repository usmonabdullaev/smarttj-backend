import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KpiMetricDto {
  @ApiProperty({ example: 1250000, description: 'Общее значение за всё время' })
  total!: number;

  @ApiProperty({ example: 340000, description: 'Значение за выбранный период' })
  current!: number;

  @ApiProperty({
    example: 280000,
    description: 'Значение за аналогичный предшествующий период',
  })
  previous!: number;

  @ApiProperty({ example: 60000, description: 'Абсолютная разница' })
  difference!: number;

  @ApiProperty({
    example: 21.43,
    description: 'Процент роста/падения (+/- %)',
  })
  growth!: number;
}

export class KpiOrdersDto extends KpiMetricDto {
  @ApiProperty({ example: 15, description: 'Количество заказов за сегодня' })
  today!: number;
}

export class KpiUsersDto extends KpiMetricDto {
  @ApiProperty({
    example: 450,
    description: 'Активных пользователей за последние 7 дней',
  })
  activeWeekly!: number;
}

export class KpiPartnersDto {
  @ApiProperty({ example: 50, description: 'Всего партнеров' })
  total!: number;

  @ApiProperty({ example: 42, description: 'Активных партнеров' })
  active!: number;

  @ApiProperty({ example: 6, description: 'Партнеров на модерации' })
  inModerate!: number;
}

export class KpiProductsDto {
  @ApiProperty({ example: 1200, description: 'Всего товаров в системе' })
  total!: number;

  @ApiProperty({ example: 980, description: 'Активных в каталоге' })
  active!: number;

  @ApiProperty({ example: 140, description: 'На модерации' })
  moderation!: number;

  @ApiProperty({ example: 80, description: 'Черновики' })
  drafts!: number;
}

export class AdminStatisticsKpiDto {
  @ApiProperty({ type: KpiMetricDto, description: 'Выручка (сомони)' })
  revenue!: KpiMetricDto;

  @ApiProperty({ type: KpiOrdersDto, description: 'Заказы' })
  orders!: KpiOrdersDto;

  @ApiProperty({ type: KpiMetricDto, description: 'Средний чек (сомони)' })
  averageCheck!: KpiMetricDto;

  @ApiProperty({ type: KpiUsersDto, description: 'Покупатели' })
  users!: KpiUsersDto;

  @ApiProperty({ type: KpiPartnersDto, description: 'Партнеры-продавцы' })
  partners!: KpiPartnersDto;

  @ApiProperty({ type: KpiProductsDto, description: 'Товары' })
  products!: KpiProductsDto;
}

export class AdminChartPointDto {
  @ApiProperty({ example: '2026-09-01' })
  date!: string;

  @ApiProperty({ example: 14500, description: 'Выручка за день (сомони)' })
  revenue!: number;

  @ApiProperty({ example: 24, description: 'Всего созданных заказов' })
  ordersCount!: number;

  @ApiProperty({ example: 19, description: 'Оплаченных заказов' })
  paidOrdersCount!: number;

  @ApiProperty({ example: 763.15, description: 'Средний чек за день' })
  averageCheck!: number;
}

export class AdminOrderHeatmapCellDto {
  @ApiProperty({ example: 1, description: 'День недели (1 = Пн ... 7 = Вс)' })
  dayOfWeek!: number;

  @ApiProperty({ example: 'Пн', description: 'Краткое название дня недели' })
  dayName!: string;

  @ApiProperty({ example: 14, description: 'Час суток (0..23)' })
  hour!: number;

  @ApiProperty({
    example: 8,
    description: 'Количество заказов, созданных в это время',
  })
  count!: number;
}

export class AdminCategorySalesDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Смартфоны' })
  name!: string;

  @ApiProperty({ example: 'smartfony' })
  slug!: string;

  @ApiProperty({ example: 145000, description: 'Выручка по категории' })
  revenue!: number;

  @ApiProperty({ example: 82, description: 'Количество проданных товаров' })
  itemsSold!: number;

  @ApiProperty({ example: 42.6, description: 'Доля в общей выручке (%)' })
  percentage!: number;
}

export class AdminTopProductDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Apple iPhone 16 Pro 256GB' })
  title!: string;

  @ApiPropertyOptional({ example: 'apple-iphone-16-pro-256gb' })
  slug?: string;

  @ApiProperty({ example: 34, description: 'Продано штук' })
  soldCount!: number;

  @ApiProperty({ example: 408000, description: 'Выручка с этого товара' })
  revenue!: number;
}

export class AdminTopPartnerDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'iStore Dushanbe' })
  title!: string;

  @ApiProperty({ example: 520000, description: 'Выручка партнера' })
  revenue!: number;

  @ApiProperty({ example: 64, description: 'Количество выполненных заказов' })
  ordersCount!: number;
}

export class AdminStatusCountDto {
  @ApiProperty({ example: 'PAID' })
  status!: string;

  @ApiProperty({ example: 142 })
  count!: number;
}

export class AdminStatisticsResponseDto {
  @ApiProperty({ example: '30d' })
  period!: string;

  @ApiProperty({ example: '2026-08-13T00:00:00.000Z' })
  from!: string;

  @ApiProperty({ example: '2026-09-12T23:59:59.999Z' })
  to!: string;

  @ApiProperty({ type: AdminStatisticsKpiDto })
  kpi!: AdminStatisticsKpiDto;

  @ApiProperty({
    type: [AdminChartPointDto],
    description:
      'Данные тренда для Area Chart (выручка, заказы, средний чек по дням)',
  })
  trend!: AdminChartPointDto[];

  @ApiProperty({
    type: [AdminOrderHeatmapCellDto],
    description:
      'Карта интенсивности заказов (Heatmap): дни недели × часы суток',
  })
  heatmap!: AdminOrderHeatmapCellDto[];

  @ApiProperty({
    type: [AdminCategorySalesDto],
    description: 'Продажи по категориям для Donut / Pie Chart',
  })
  categories!: AdminCategorySalesDto[];

  @ApiProperty({
    type: [AdminTopProductDto],
    description: 'Топ-5 продаваемых товаров',
  })
  topProducts!: AdminTopProductDto[];

  @ApiProperty({
    type: [AdminTopPartnerDto],
    description: 'Топ-5 партнеров по объему продаж',
  })
  topPartners!: AdminTopPartnerDto[];

  @ApiProperty({
    type: [AdminStatusCountDto],
    description: 'Распределение статусов оплаты',
  })
  paymentStatuses!: AdminStatusCountDto[];

  @ApiProperty({
    type: [AdminStatusCountDto],
    description: 'Распределение статусов доставки',
  })
  deliveryStatuses!: AdminStatusCountDto[];
}
