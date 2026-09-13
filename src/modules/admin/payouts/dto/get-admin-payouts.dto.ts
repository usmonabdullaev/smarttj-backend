import { ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum AdminPayoutSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAdminPayoutsDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество записей на странице',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: PayoutStatus,
    description: 'Фильтр по статусу заявки',
  })
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @ApiPropertyOptional({
    description: 'Фильтр по конкретному партнёру (UUID)',
  })
  @IsOptional()
  @IsUUID('7')
  partnerId?: string;

  @ApiPropertyOptional({
    description: 'Дата начала периода (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    description: 'Дата окончания периода (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({
    description: 'Поиск по названию магазина, ИНН или номеру платёжки',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: AdminPayoutSortOrder,
    description: 'Сортировка по дате подачи',
    default: AdminPayoutSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(AdminPayoutSortOrder)
  sortOrder?: AdminPayoutSortOrder = AdminPayoutSortOrder.DESC;
}
