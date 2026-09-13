import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartnerBalanceDto {
  @ApiProperty({
    example: 34500,
    description:
      'Доступно к выводу прямо сейчас (после вычета комиссии и уже зарезервированных заявок)',
  })
  available!: number;

  @ApiProperty({
    example: 12800,
    description:
      'В холде / заморозке: средства по оплаченным заказам на этапе доставки покупателю',
  })
  pending!: number;

  @ApiProperty({
    example: 5000,
    description:
      'Зарезервировано в активных заявках на вывод (PENDING / PROCESSING)',
  })
  reserved!: number;

  @ApiProperty({
    example: 45000,
    description: 'Фактически выплачено партнёру за всё время (COMPLETED)',
  })
  withdrawn!: number;

  @ApiProperty({
    example: 96700,
    description:
      'Всего заработано партнёром чистыми (после вычета комиссии площадки)',
  })
  totalEarned!: number;

  @ApiProperty({
    example: 5100,
    description: 'Всего удержано комиссии маркетплейсом',
  })
  totalCommissionPaid!: number;

  @ApiProperty({
    example: 2100,
    description: 'Сумма возвратов по отмененным или возвращенным позициям',
  })
  refunded!: number;
}

export class PartnerMonthlyStatsDto {
  @ApiProperty({
    example: 45000,
    description: 'Выручка за текущий календарный месяц (до вычета комиссии)',
  })
  revenue!: number;

  @ApiProperty({
    example: 42750,
    description: 'Чистый доход партнера за текущий месяц (после комиссии)',
  })
  payoutAmount!: number;

  @ApiProperty({
    example: 85,
    description: 'Количество оплаченных заказов за месяц',
  })
  ordersCount!: number;

  @ApiProperty({
    example: 120,
    description: 'Количество проданных единиц товаров',
  })
  itemsSold!: number;

  @ApiProperty({ example: 529, description: 'Средний чек за текущий месяц' })
  averageCheck!: number;
}

export enum PayoutMethodType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CARD = 'CARD',
  NONE = 'NONE',
}

export class PartnerRequisitesStatusDto {
  @ApiProperty({
    example: true,
    description: 'Заполнены ли основные реквизиты для осуществления выплат',
  })
  isComplete!: boolean;

  @ApiProperty({
    enum: PayoutMethodType,
    example: PayoutMethodType.BANK_ACCOUNT,
    description: 'Основной способ получения выплат',
  })
  payoutMethod!: PayoutMethodType;

  @ApiPropertyOptional({
    example: ['bankAccount', 'bik'],
    description:
      'Список незаполненных обязательных полей (если реквизиты не полные)',
  })
  missingFields?: string[];
}

export class PartnerFinancesSummaryResponseDto {
  @ApiProperty({
    example: 5.0,
    description:
      'Текущая ставка комиссии маркетплейса для данного магазина (%)',
  })
  commissionRate!: number;

  @ApiProperty({
    type: PartnerBalanceDto,
    description: 'Баланс выплат партнера',
  })
  balance!: PartnerBalanceDto;

  @ApiProperty({
    type: PartnerMonthlyStatsDto,
    description: 'Статистика за текущий календарный месяц',
  })
  monthlyStats!: PartnerMonthlyStatsDto;

  @ApiProperty({
    type: PartnerRequisitesStatusDto,
    description: 'Статус заполнения платежных реквизитов',
  })
  requisitesStatus!: PartnerRequisitesStatusDto;
}
