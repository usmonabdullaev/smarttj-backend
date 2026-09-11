import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { AlifGate } from '../../types/alif.types';

export class InitPaymentRequest {
  @ApiProperty({
    description: 'Идентификатор заказа в SmartTJ',
    example: '018e69e7-d2b1-7f83-9b1b-7a32e1850123',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @ApiPropertyOptional({
    description: 'Способ оплаты Alif WebCheckout',
    enum: AlifGate,
    example: AlifGate.KORTI_MILLI,
  })
  @IsOptional()
  @IsEnum(AlifGate)
  gate?: AlifGate;

  @ApiPropertyOptional({
    description: 'URL возврата покупателя после завершения оплаты',
    example: 'https://smarttj-web.vercel.app/payment/success',
  })
  @IsOptional()
  @IsUrl()
  returnUrl?: string;
}
