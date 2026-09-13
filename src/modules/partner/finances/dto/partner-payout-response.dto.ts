import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutStatus } from '@prisma/client';

export class PayoutRequestItemDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 1500, description: 'Сумма выплаты' })
  amount!: number;

  @ApiProperty({
    enum: PayoutStatus,
    example: PayoutStatus.PENDING,
    description: 'Статус заявки на вывод',
  })
  status!: PayoutStatus;

  @ApiProperty({
    example: 'BANK_ACCOUNT',
    description: 'Способ выплаты (BANK_ACCOUNT или CARD)',
  })
  payoutMethod!: string;

  @ApiProperty({
    example: {
      inn: '123456789',
      bankName: 'ОАО Ориёнбанк',
      bankAccount: 'TJ24IBAN...',
      bik: '350101123',
    },
    description: 'Снапшот реквизитов на момент подачи заявки',
  })
  requisitesSnapshot!: Record<string, any>;

  @ApiPropertyOptional({ example: 'За первую половину месяца', nullable: true })
  comment?: string | null;

  @ApiPropertyOptional({
    example: 'Неверно указан расчетный счет',
    nullable: true,
    description: 'Причина отказа (если статус REJECTED)',
  })
  rejectReason?: string | null;

  @ApiPropertyOptional({
    example: 'П/П №48920 от 13.09.2026',
    nullable: true,
    description: 'Номер платёжного поручения из банка (при COMPLETED)',
  })
  transactionReference?: string | null;

  @ApiPropertyOptional({
    example: '2026-09-13T12:00:00.000Z',
    nullable: true,
    description: 'Дата обработки заявки',
  })
  processedAt?: Date | null;

  @ApiProperty({ example: '2026-09-13T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-13T10:00:00.000Z' })
  updatedAt!: Date;
}

export class PartnerPayoutsPaginationDto {
  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;

  @ApiProperty({ example: false })
  hasPrevPage!: boolean;

  @ApiProperty({ example: false })
  hasNextPage!: boolean;
}

export class PartnerPayoutsListResponseDto {
  @ApiProperty({
    type: [PayoutRequestItemDto],
    description: 'Список заявок на вывод средств',
  })
  items!: PayoutRequestItemDto[];

  @ApiProperty({
    type: PartnerPayoutsPaginationDto,
    description: 'Метаданные пагинации',
  })
  pagination!: PartnerPayoutsPaginationDto;
}
