import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum AdminStatisticsPeriod {
  DAYS_7 = '7d',
  DAYS_30 = '30d',
  DAYS_90 = '90d',
  YEAR = 'year',
}

export class GetAdminStatisticsQueryDto {
  @ApiPropertyOptional({
    enum: AdminStatisticsPeriod,
    default: AdminStatisticsPeriod.DAYS_30,
    description:
      'Период для построения аналитики и графиков: 7d (неделя), 30d (месяц), 90d (квартал), year (год)',
  })
  @IsOptional()
  @IsEnum(AdminStatisticsPeriod)
  period: AdminStatisticsPeriod = AdminStatisticsPeriod.DAYS_30;
}
