import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
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

export enum AdminReviewSortBy {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
}

export enum AdminSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAdminReviewsDto {
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
    description: 'Количество элементов на странице',
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
    enum: ReviewStatus,
    description:
      'Фильтр по статусу отзыва ("AUTO_MODERATION", "MANUAL_MODERATION", "PUBLISHED", "REJECTED", "HIDDEN")',
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Фильтр по точной оценке (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по товару (UUID)',
  })
  @IsOptional()
  @IsUUID('7')
  productId?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по партнеру-продавцу (UUID)',
  })
  @IsOptional()
  @IsUUID('7')
  partnerId?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по покупателю (UUID)',
  })
  @IsOptional()
  @IsUUID('7')
  userId?: string;

  @ApiPropertyOptional({
    description:
      'Поисковая строка (по тексту отзыва, достоинствам, недостаткам, имени покупателя или названию товара)',
  })
  @IsOptional()
  @IsString()
  q?: string;

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
    enum: AdminReviewSortBy,
    description: 'Поле сортировки',
    default: AdminReviewSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(AdminReviewSortBy)
  sortBy?: AdminReviewSortBy = AdminReviewSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: AdminSortOrder,
    description: 'Направление сортировки',
    default: AdminSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(AdminSortOrder)
  sortOrder?: AdminSortOrder = AdminSortOrder.DESC;
}
