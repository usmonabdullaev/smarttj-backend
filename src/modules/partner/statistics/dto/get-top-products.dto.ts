import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum TopProductsPeriod {
  DAYS_7 = '7d',
  MONTH_1 = '1m',
  MONTHS_3 = '3m',
  ALL = 'all',
}

export class GetTopProductsDto {
  @ApiPropertyOptional({
    description: 'Количество товаров в выборке (по умолчанию 5, максимум 50)',
    default: 5,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 5;

  @ApiPropertyOptional({
    enum: TopProductsPeriod,
    description:
      'Период выборки: 7d (7 дней), 1m (1 месяц), 3m (3 месяца), all (за все время)',
    default: TopProductsPeriod.ALL,
  })
  @IsOptional()
  @IsEnum(TopProductsPeriod)
  period?: TopProductsPeriod = TopProductsPeriod.ALL;
}
