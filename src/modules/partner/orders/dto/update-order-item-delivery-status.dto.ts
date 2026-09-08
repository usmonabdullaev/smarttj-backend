import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDeliveryStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderItemDeliveryStatusDto {
  @ApiProperty({
    enum: OrderItemDeliveryStatus,
    description: 'Новый статус доставки конкретного товара',
    example: OrderItemDeliveryStatus.SHIPPED,
  })
  @IsEnum(OrderItemDeliveryStatus)
  deliveryStatus!: OrderItemDeliveryStatus;
}
