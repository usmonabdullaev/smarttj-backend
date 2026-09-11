import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CancelPaymentRequest {
  @ApiProperty({
    description: 'Идентификатор заказа в SmartTJ для отмены платежа',
    example: '018e69e7-d2b1-7f83-9b1b-7a32e1850123',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @ApiPropertyOptional({
    description: 'Причина отмены платежа',
    example: 'Отмена по запросу клиента',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
