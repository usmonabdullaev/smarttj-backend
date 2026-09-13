import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RatingDistributionItemDto {
  @ApiProperty({
    example: 15,
    description: 'Количество отзывов с этой оценкой',
  })
  count!: number;

  @ApiProperty({
    example: 31.2,
    description: 'Процент от общего количества отзывов',
  })
  percentage!: number;
}

export class RatingDistributionDto {
  @ApiProperty({ type: RatingDistributionItemDto, description: '1 звезда' })
  1!: RatingDistributionItemDto;

  @ApiProperty({ type: RatingDistributionItemDto, description: '2 звезды' })
  2!: RatingDistributionItemDto;

  @ApiProperty({ type: RatingDistributionItemDto, description: '3 звезды' })
  3!: RatingDistributionItemDto;

  @ApiProperty({ type: RatingDistributionItemDto, description: '4 звезды' })
  4!: RatingDistributionItemDto;

  @ApiProperty({ type: RatingDistributionItemDto, description: '5 звезд' })
  5!: RatingDistributionItemDto;
}

export class ProductRatingOverviewDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 'Смартфон Apple iPhone 15' })
  title!: string;

  @ApiPropertyOptional({ example: 'apple-iphone-15', nullable: true })
  slug?: string | null;

  @ApiProperty({ example: 4.9, description: 'Средний рейтинг' })
  averageRating!: number;

  @ApiProperty({ example: 38, description: 'Количество отзывов' })
  reviewsCount!: number;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../iphone.jpg',
    nullable: true,
  })
  imageUrl?: string | null;
}

export class PartnerReviewsSummaryResponseDto {
  @ApiProperty({
    example: 4.6,
    description: 'Средний рейтинг товаров партнера по всем отзывам',
  })
  averageRating!: number;

  @ApiProperty({
    example: 120,
    description: 'Всего отзывов на товары партнера',
  })
  totalReviews!: number;

  @ApiProperty({
    example: 85,
    description: 'Количество отзывов с развернутым комментарием',
  })
  withCommentsCount!: number;

  @ApiProperty({
    type: RatingDistributionDto,
    description: 'Распределение отзывов по оценкам (от 1 до 5)',
  })
  ratingDistribution!: RatingDistributionDto;

  @ApiProperty({
    type: [ProductRatingOverviewDto],
    description: 'Топ товаров с лучшим рейтингом',
  })
  topRatedProducts!: ProductRatingOverviewDto[];

  @ApiProperty({
    type: [ProductRatingOverviewDto],
    description: 'Товары, требующие внимания (низкие оценки или рейтинг < 4.0)',
  })
  lowRatedProducts!: ProductRatingOverviewDto[];
}
