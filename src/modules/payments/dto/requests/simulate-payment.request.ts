import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum SimulatePaymentStatus {
  OK = 'ok',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export class SimulatePaymentRequest {
  @ApiProperty({
    description: 'Идентификатор заказа в SmartTJ',
    example: '018e69e7-d2b1-7f83-9b1b-7a32e1850123',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({
    description: 'Имитируемый статус оплаты от шлюза Alif',
    enum: SimulatePaymentStatus,
    example: SimulatePaymentStatus.OK,
  })
  @IsEnum(SimulatePaymentStatus)
  status!: SimulatePaymentStatus;
}
