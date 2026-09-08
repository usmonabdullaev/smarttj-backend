import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SalesPeriod {
  DAYS_7 = '7d',
  MONTH_1 = '1m',
  MONTHS_3 = '3m',
}

export class GetSalesChartDto {
  @ApiPropertyOptional({
    enum: SalesPeriod,
    description: 'Период: 7d (7 дней), 1m (1 месяц), 3m (3 месяца)',
    default: SalesPeriod.MONTH_1,
  })
  @IsOptional()
  @IsEnum(SalesPeriod)
  period?: SalesPeriod = SalesPeriod.MONTH_1;
}
