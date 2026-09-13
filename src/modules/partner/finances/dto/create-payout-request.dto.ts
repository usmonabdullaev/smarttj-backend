import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePayoutRequestDto {
  @ApiProperty({
    example: 500,
    description: 'Запрашиваемая сумма вывода в сомони (минимум 50)',
    minimum: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(50, { message: 'Минимальная сумма вывода составляет 50 сомони' })
  @Max(1000000)
  amount!: number;

  @ApiPropertyOptional({
    example: 'Выплата за первую половину месяца',
    description: 'Примечание к заявке на вывод',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  comment?: string;
}
