import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetAdminTransactionsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: TransactionStatus,
    description: 'Фильтр по статусу транзакции (SUCCESS, REFUNDED)',
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    example: 'ALIF',
    description: 'Провайдер эквайринга',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({
    example: 'korti_milli',
    description: 'Платежный шлюз (korti_milli, wallet, salom, cybersource)',
  })
  @IsOptional()
  @IsString()
  paymentGate?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по ID пользователя/плательщика',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по ID заказа',
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Начало периода (ISO дата)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-09-30',
    description: 'Конец периода (ISO дата)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    example: '622617',
    description:
      'Поиск по номеру заказа, ID транзакции, RRN провайдера, маске карты или телефону плательщика',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
