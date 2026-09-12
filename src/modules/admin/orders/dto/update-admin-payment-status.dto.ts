import { ApiProperty } from '@nestjs/swagger';
import { OrderPaymentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAdminPaymentStatusDto {
  @ApiProperty({
    enum: OrderPaymentStatus,
    example: OrderPaymentStatus.PAID,
    description: 'Новый статус оплаты заказа',
  })
  @IsNotEmpty()
  @IsEnum(OrderPaymentStatus)
  paymentStatus!: OrderPaymentStatus;
}
