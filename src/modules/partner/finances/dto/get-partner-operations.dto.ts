import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum PayoutOperationStatus {
  ALL = 'ALL',
  AVAILABLE = 'AVAILABLE',
  HOLD = 'HOLD',
  REFUNDED = 'REFUNDED',
}

export enum FinanceSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetPartnerOperationsDto {
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
    enum: PayoutOperationStatus,
    description:
      'Статус начисления: AVAILABLE (доступно к выплате), HOLD (в процессе доставки), REFUNDED (возврат), ALL (все)',
    default: PayoutOperationStatus.ALL,
  })
  @IsOptional()
  @IsEnum(PayoutOperationStatus)
  status?: PayoutOperationStatus = PayoutOperationStatus.ALL;

  @ApiPropertyOptional({
    description: 'Дата начала периода (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    description: 'Дата окончания периода (ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({
    description: 'Поиск по названию товара, артикулу (SKU) или номеру заказа',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: FinanceSortOrder,
    description: 'Направление сортировки по дате заказа',
    default: FinanceSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(FinanceSortOrder)
  sortOrder?: FinanceSortOrder = FinanceSortOrder.DESC;
}
