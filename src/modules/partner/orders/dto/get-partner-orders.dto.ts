import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderDeliveryStatus,
  OrderItemDeliveryStatus,
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

export class GetPartnerOrdersDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    enum: OrderDeliveryStatus,
    description: 'Общий статус доставки заказа',
  })
  @IsOptional()
  @IsEnum(OrderDeliveryStatus)
  deliveryStatus?: OrderDeliveryStatus;

  @ApiPropertyOptional({
    enum: OrderItemDeliveryStatus,
    description: 'Статус доставки товаров партнёра',
  })
  @IsOptional()
  @IsEnum(OrderItemDeliveryStatus)
  itemDeliveryStatus?: OrderItemDeliveryStatus;

  @ApiPropertyOptional({
    enum: OrderPaymentStatus,
    description: 'Статус оплаты заказа',
  })
  @IsOptional()
  @IsEnum(OrderPaymentStatus)
  paymentStatus?: OrderPaymentStatus;

  @ApiPropertyOptional({
    enum: OrderType,
    description: 'Тип заказа (доставка или самовывоз)',
  })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiPropertyOptional({
    example: 'Поиск по ID заказа, имени клиента или названию товара',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Начальная дата (ISO)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Конечная дата (ISO)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
