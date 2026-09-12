import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAttemptStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetAdminPaymentAttemptsDto {
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
    enum: PaymentAttemptStatus,
    description:
      'Статус попытки (PENDING, FAILED, SUCCESS, CANCELED, REFUNDED)',
  })
  @IsOptional()
  @IsEnum(PaymentAttemptStatus)
  status?: PaymentAttemptStatus;

  @ApiPropertyOptional({ description: 'Фильтр по ID заказа' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Фильтр по ID пользователя' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    example: 'Недостаточно средств',
    description: 'Поиск по тексту ошибки или ID провайдера',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
