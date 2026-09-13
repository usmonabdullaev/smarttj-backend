import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ReviewAuthorDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Усмон А.' })
  name!: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/avatar.jpg',
  })
  avatar?: string | null;
}

export class ReviewVariantSummaryDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000002' })
  id!: string;

  @ApiProperty({ example: 'Черный / 256GB' })
  label!: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/variant.jpg',
  })
  imageUrl?: string | null;
}

export class ReviewResponseDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000003' })
  id!: string;

  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000004' })
  productId!: string;

  @ApiPropertyOptional({ example: '0192e21b-68d1-7000-8000-000000000002' })
  productVariantId?: string | null;

  @ApiProperty({ type: ReviewAuthorDto })
  user!: ReviewAuthorDto;

  @ApiPropertyOptional({ type: ReviewVariantSummaryDto })
  variant?: ReviewVariantSummaryDto | null;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiPropertyOptional({ example: 'Отличная камера' })
  advantages?: string | null;

  @ApiPropertyOptional({ example: 'Нет' })
  flaws?: string | null;

  @ApiPropertyOptional({ example: 'Очень доволен покупкой' })
  comment?: string | null;

  @ApiProperty({
    example: ['https://res.cloudinary.com/demo/review1.jpg'],
    type: [String],
  })
  images!: string[];

  @ApiProperty({
    example: true,
    description: 'Подтвержденная покупка на маркетплейсе',
  })
  isVerified!: boolean;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PUBLISHED })
  status!: ReviewStatus;

  @ApiPropertyOptional({
    example: 'Спасибо за отзыв! Приятного использования.',
  })
  replyComment?: string | null;

  @ApiPropertyOptional({ example: '2026-09-13T10:00:00.000Z' })
  repliedAt?: Date | null;

  @ApiProperty({ example: 12, description: 'Количество отметок полезности' })
  likesCount!: number;

  @ApiProperty({ example: '2026-09-13T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-13T09:00:00.000Z' })
  updatedAt!: Date;
}

export class ProductRatingStatsDto {
  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 42 })
  totalReviews!: number;

  @ApiProperty({ example: { 5: 35, 4: 5, 3: 2, 2: 0, 1: 0 } })
  distribution!: Record<number, number>;
}

export class ProductReviewsPaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class ProductReviewsListResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  items!: ReviewResponseDto[];

  @ApiProperty({ type: ProductReviewsPaginationDto })
  pagination!: ProductReviewsPaginationDto;

  @ApiProperty({ type: ProductRatingStatsDto })
  stats!: ProductRatingStatsDto;
}

export class MyReviewsListResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  items!: ReviewResponseDto[];

  @ApiProperty({ type: ProductReviewsPaginationDto })
  pagination!: ProductReviewsPaginationDto;
}
