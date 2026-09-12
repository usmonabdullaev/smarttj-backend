import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAttemptStatus, TransactionStatus } from '@prisma/client';

export class AdminTransactionUserDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name!: string;

  @ApiProperty({ example: '992900000000' })
  phone!: string;

  @ApiPropertyOptional({ example: 'ivan@example.com', nullable: true })
  email?: string | null;
}

export class AdminTransactionDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  userId!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  orderId!: string;

  @ApiProperty({ example: 4500, description: 'Сумма транзакции (сомони)' })
  amount!: number;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.SUCCESS })
  status!: TransactionStatus;

  @ApiPropertyOptional({ example: 'ALIF', nullable: true })
  provider?: string | null;

  @ApiPropertyOptional({ example: 'TRANS-123456789', nullable: true })
  providerId?: string | null;

  @ApiPropertyOptional({ example: 'korti_milli', nullable: true })
  paymentGate?: string | null;

  @ApiPropertyOptional({ example: '622617******1234', nullable: true })
  payerAccount?: string | null;

  @ApiPropertyOptional({ example: '992900000000', nullable: true })
  payerPhone?: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  metadata?: any;

  @ApiProperty({ example: '2026-09-12T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: AdminTransactionUserDto })
  user!: AdminTransactionUserDto;

  @ApiPropertyOptional({ type: Object })
  order?: any;

  @ApiPropertyOptional({ type: [Object] })
  paymentAttempts?: any[];
}

export class AdminPaymentAttemptDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  userId!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  orderId!: string;

  @ApiProperty({ example: 4500 })
  amount!: number;

  @ApiProperty({
    enum: PaymentAttemptStatus,
    example: PaymentAttemptStatus.FAILED,
  })
  status!: PaymentAttemptStatus;

  @ApiPropertyOptional({ example: 'ALIF', nullable: true })
  provider?: string | null;

  @ApiPropertyOptional({
    example: 'Недостаточно средств на карте',
    nullable: true,
  })
  errorMessage?: string | null;

  @ApiPropertyOptional({ example: 'https://alif.tj/pay/...', nullable: true })
  paymentUrl?: string | null;

  @ApiProperty({ example: '2026-09-12T12:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: AdminTransactionUserDto })
  user?: AdminTransactionUserDto;
}

export class AdminTransactionsSummaryDto {
  @ApiProperty({
    example: 1250000,
    description: 'Общая сумма успешных оплат (сомони)',
  })
  totalSuccessAmount!: number;

  @ApiProperty({
    example: 45000,
    description: 'Общая сумма возвратов (сомони)',
  })
  totalRefundedAmount!: number;

  @ApiProperty({ example: 420, description: 'Всего успешных транзакций' })
  successCount!: number;

  @ApiProperty({ example: 12, description: 'Всего возвратов' })
  refundedCount!: number;
}
