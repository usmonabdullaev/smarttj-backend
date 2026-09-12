import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelAdminOrderDto {
  @ApiProperty({
    example: 'Товар отсутствует на складе поставщика',
    description: 'Обязательная причина отмены заказа администратором',
  })
  @IsNotEmpty({ message: 'Причина отмены заказа обязательна' })
  @IsString()
  @MaxLength(500)
  reason!: string;
}
