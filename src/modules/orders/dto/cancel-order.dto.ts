import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({
    description: 'Причина отмены заказа',
    example: 'Передумал покупать / нашел дешевле',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
