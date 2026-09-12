import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderDeliveryStatus,
  OrderPaymentStatus,
  OrderType,
} from '@prisma/client';
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

export class GetAdminOrdersDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: OrderPaymentStatus,
    description: 'Фильтр по статусу оплаты',
  })
  @IsOptional()
  @IsEnum(OrderPaymentStatus)
  paymentStatus?: OrderPaymentStatus;

  @ApiPropertyOptional({
    enum: OrderDeliveryStatus,
    description: 'Фильтр по статусу доставки',
  })
  @IsOptional()
  @IsEnum(OrderDeliveryStatus)
  deliveryStatus?: OrderDeliveryStatus;

  @ApiPropertyOptional({
    enum: OrderType,
    description: 'Тип доставки (PICKUP - самовывоз, DELIVERY - курьером)',
  })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiPropertyOptional({
    description: 'Фильтр по ID партнера-продавца',
  })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по ID пользователя/покупателя',
  })
  @IsOptional()
  @IsString()
  userId?: string;

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
    example: '992900000000',
    description: 'Поиск по ID заказа, имени или номеру телефона клиента',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
