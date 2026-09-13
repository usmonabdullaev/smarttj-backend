import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartnerMetricCardDto {
  @ApiProperty({ example: 42, description: 'Количество' })
  count!: number;

  @ApiProperty({ example: 'Всего товаров', description: 'Заголовок карточки' })
  label!: string;

  @ApiProperty({
    example: 'В каталоге магазина',
    description: 'Описание карточки',
  })
  description!: string;
}

export class PartnerProductsCardsDto {
  @ApiProperty({ type: PartnerMetricCardDto })
  total!: PartnerMetricCardDto;

  @ApiProperty({ type: PartnerMetricCardDto })
  active!: PartnerMetricCardDto;

  @ApiProperty({ type: PartnerMetricCardDto })
  moderation!: PartnerMetricCardDto;

  @ApiProperty({ type: PartnerMetricCardDto })
  drafts!: PartnerMetricCardDto;
}

export class PartnerRevenueStatsDto {
  @ApiProperty({
    example: 125000,
    description: 'Суммарная выручка за все время (оплаченные заказы)',
  })
  total!: number;

  @ApiProperty({ example: 45000, description: 'Выручка за текущий месяц' })
  thisMonth!: number;

  @ApiProperty({ example: 1800, description: 'Выручка за сегодня' })
  today!: number;

  @ApiProperty({
    example: 12.5,
    description: 'Процент роста выручки к предыдущему месяцу',
    nullable: true,
  })
  growthPercent!: number | null;

  @ApiProperty({
    example: 350,
    description: 'Средний чек за текущий месяц',
  })
  averageCheck!: number;
}

export class PartnerOrdersStatsDto {
  @ApiProperty({
    example: 320,
    description: 'Всего оформленных оплаченных заказов',
  })
  total!: number;

  @ApiProperty({
    example: 85,
    description: 'Количество оплаченных заказов за текущий месяц',
  })
  thisMonth!: number;

  @ApiProperty({
    example: 6,
    description: 'Количество оплаченных заказов за сегодня',
  })
  today!: number;

  @ApiProperty({
    example: 14,
    description: 'Количество активных оплаченных заказов в обработке/доставке',
  })
  pending!: number;

  @ApiProperty({
    example: 8.2,
    description: 'Процент роста заказов к предыдущему месяцу',
    nullable: true,
  })
  growthPercent!: number | null;
}

export class PartnerCardsResponseDto {
  @ApiProperty({
    type: PartnerRevenueStatsDto,
    description: 'Карточки выручки',
  })
  revenue!: PartnerRevenueStatsDto;

  @ApiProperty({
    type: PartnerOrdersStatsDto,
    description: 'Карточки заказов',
  })
  orders!: PartnerOrdersStatsDto;

  @ApiProperty({
    type: PartnerProductsCardsDto,
    description: 'Карточки товаров',
  })
  products!: PartnerProductsCardsDto;

  // Поля обратной совместимости
  @ApiProperty({ type: PartnerMetricCardDto })
  total!: PartnerMetricCardDto;

  @ApiProperty({ type: PartnerMetricCardDto })
  active!: PartnerMetricCardDto;

  @ApiProperty({ type: PartnerMetricCardDto })
  moderation!: PartnerMetricCardDto;

  @ApiProperty({ type: PartnerMetricCardDto })
  drafts!: PartnerMetricCardDto;
}

export class PartnerTopProductCategoryDto {
  @ApiPropertyOptional({ example: 'cat-uuid-1', nullable: true })
  id?: string | null;

  @ApiPropertyOptional({ example: 'Смартфоны', nullable: true })
  name?: string | null;
}

export class PartnerTopProductItemDto {
  @ApiProperty({ example: 'prod-uuid-1', description: 'Идентификатор товара' })
  id!: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Название товара' })
  title!: string;

  @ApiPropertyOptional({
    example: 'iphone-15-pro-max',
    description: 'URL-слаг товара',
  })
  slug?: string;

  @ApiProperty({
    example: 35,
    description: 'Количество проданных единиц в оплаченных заказах',
  })
  soldCount!: number;

  @ApiProperty({
    example: 450000,
    description: 'Суммарная выручка по товару',
  })
  revenue!: number;

  @ApiProperty({
    example: 28,
    description: 'Количество заказов, содержащих товар',
  })
  ordersCount!: number;

  @ApiProperty({
    example: 12,
    description: 'Текущий остаток на складе по всем вариантам',
  })
  currentStock!: number;

  @ApiProperty({ example: 4.8, description: 'Средний рейтинг товара' })
  averageRating!: number;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../iphone.jpg',
    description: 'Основное изображение товара',
    nullable: true,
  })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    type: PartnerTopProductCategoryDto,
    description: 'Категория товара',
  })
  category?: PartnerTopProductCategoryDto;
}
