import { ApiProperty } from '@nestjs/swagger';
import { OrderDeliveryStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAdminOrderStatusDto {
  @ApiProperty({
    enum: OrderDeliveryStatus,
    example: OrderDeliveryStatus.DELIVERED,
    description: 'Новый статус доставки заказа',
  })
  @IsNotEmpty()
  @IsEnum(OrderDeliveryStatus)
  deliveryStatus!: OrderDeliveryStatus;
}
