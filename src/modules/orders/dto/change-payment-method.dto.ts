import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangePaymentMethodDto {
  @ApiProperty({
    description: 'Идентификатор нового способа оплаты',
    example: '018e69e7-d2b1-7f83-9b1b-7a32e1850123',
  })
  @IsUUID()
  @IsNotEmpty()
  paymentMethodId!: string;
}
