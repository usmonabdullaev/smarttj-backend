import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum ClientReviewSortBy {
  NEWEST = 'newest',
  HIGHEST_RATING = 'highest_rating',
  LOWEST_RATING = 'lowest_rating',
}

export class GetProductReviewsDto {
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
    description: 'Количество отзывов на странице',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Фильтр по точной оценке (1, 2, 3, 4, 5)',
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
    description: 'Только отзывы с фотографиями',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withPhotos?: boolean;

  @ApiPropertyOptional({
    enum: ClientReviewSortBy,
    description: 'Сортировка отзывов',
    default: ClientReviewSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(ClientReviewSortBy)
  sortBy?: ClientReviewSortBy = ClientReviewSortBy.NEWEST;
}
