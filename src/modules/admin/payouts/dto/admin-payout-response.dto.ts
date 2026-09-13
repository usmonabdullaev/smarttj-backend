import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutStatus } from '@prisma/client';

export class AdminPayoutPartnerDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 'Smart Store' })
  title!: string;

  @ApiPropertyOptional({ example: '123456789', nullable: true })
  inn?: string | null;

  @ApiProperty({ example: '+992900000000' })
  phone1!: string;

  @ApiProperty({ example: 5.0, description: 'Ставка комиссии партнера (%)' })
  commissionRate!: number;
}

export class AdminPayoutProcessorDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name!: string;
}

export class AdminPayoutItemDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  partnerId!: string;

  @ApiProperty({ example: 2500, description: 'Сумма выплаты в сомони' })
  amount!: number;

  @ApiProperty({
    enum: PayoutStatus,
    example: PayoutStatus.PENDING,
    description: 'Статус заявки на вывод',
  })
  status!: PayoutStatus;

  @ApiProperty({ example: 'BANK_ACCOUNT' })
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

  @ApiPropertyOptional({ example: 'Выплата за июль', nullable: true })
  comment?: string | null;

  @ApiPropertyOptional({
    example: 'Неверный расчетный счет',
    nullable: true,
    description: 'Причина отказа',
  })
  rejectReason?: string | null;

  @ApiPropertyOptional({
    example: 'П/П №10492 от 13.09.2026',
    nullable: true,
    description: 'Номер платёжного поручения банка',
  })
  transactionReference?: string | null;

  @ApiPropertyOptional({ example: '2026-09-13T12:00:00.000Z', nullable: true })
  processedAt?: Date | null;

  @ApiProperty({ example: '2026-09-13T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-13T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: AdminPayoutPartnerDto })
  partner!: AdminPayoutPartnerDto;

  @ApiPropertyOptional({ type: AdminPayoutProcessorDto, nullable: true })
  processedBy?: AdminPayoutProcessorDto | null;
}

export class AdminPayoutsPaginationDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;

  @ApiProperty({ example: false })
  hasPrevPage!: boolean;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;
}

export class AdminPayoutsListResponseDto {
  @ApiProperty({
    type: [AdminPayoutItemDto],
    description: 'Список заявок на выплату',
  })
  items!: AdminPayoutItemDto[];

  @ApiProperty({
    type: AdminPayoutsPaginationDto,
    description: 'Метаданные пагинации',
  })
  pagination!: AdminPayoutsPaginationDto;
}
