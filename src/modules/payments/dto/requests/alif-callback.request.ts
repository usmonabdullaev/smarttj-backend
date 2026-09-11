import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AlifCallbackRequest {
  @ApiProperty({
    description: 'ID заказа мерчанта',
    example: '018e69e7-d2b1-7f83-9b1b-7a32e1850123',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({
    description: 'ID транзакции в системе Alif',
    example: '789012',
  })
  @IsNotEmpty()
  transactionId!: string | number;

  @ApiProperty({
    description: 'Статус операции: ok, failed, canceled, pending',
    example: 'ok',
  })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ description: 'HMAC SHA256 подпись уведомления' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiPropertyOptional({ description: 'Сумма операции' })
  @IsOptional()
  amount?: number | string;

  @ApiPropertyOptional({ description: 'Маскированный номер счета/карты' })
  @IsOptional()
  account?: string;

  @ApiPropertyOptional({ description: 'Номер телефона покупателя' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Тип шлюза / метод оплаты' })
  @IsOptional()
  transaction_type?: string;

  @ApiPropertyOptional({ description: 'Дата/время транзакции' })
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({ description: 'Код ответа' })
  @IsOptional()
  code?: number;

  @ApiPropertyOptional({ description: 'Сообщение' })
  @IsOptional()
  message?: string;
}
