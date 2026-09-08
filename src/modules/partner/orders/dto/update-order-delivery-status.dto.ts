import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDeliveryStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderDeliveryStatusDto {
  @ApiProperty({
    enum: OrderItemDeliveryStatus,
    description: 'Новый статус доставки для товаров партнёра в заказе',
    example: OrderItemDeliveryStatus.SHIPPED,
  })
  @IsEnum(OrderItemDeliveryStatus)
  deliveryStatus!: OrderItemDeliveryStatus;
}
