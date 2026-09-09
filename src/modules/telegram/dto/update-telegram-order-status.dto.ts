import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDeliveryStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateTelegramOrderStatusDto {
  @ApiProperty({
    enum: OrderItemDeliveryStatus,
    example: OrderItemDeliveryStatus.SHIPPED,
    description: 'Новый статус доставки для товаров партнёра в заказе',
  })
  @IsEnum(OrderItemDeliveryStatus)
  deliveryStatus!: OrderItemDeliveryStatus;
}
