import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ReviewUserDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 'Алишер С.' })
  name!: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../avatar.jpg',
    nullable: true,
  })
  avatar?: string | null;
}

export class ReviewProductDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 'Беспроводные наушники Sony WH-1000XM5' })
  title!: string;

  @ApiPropertyOptional({ example: 'sony-wh-1000xm5', nullable: true })
  slug?: string | null;

  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 24 })
  reviewsCount!: number;
}

export class ReviewVariantDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiPropertyOptional({ example: 'Черный, 256GB', nullable: true })
  label?: string | null;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../photo.jpg',
    nullable: true,
  })
  imageUrl?: string | null;
}

export class PartnerReviewItemDto {
  @ApiProperty({ example: '0191e4b3-764a-7182-93cb-5690b2b8da45' })
  id!: string;

  @ApiProperty({ example: 5, description: 'Оценка (1-5)' })
  rating!: number;

  @ApiProperty({
    example: 'Отличное шумоподавление и качественные материалы',
    description: 'Достоинства товара',
  })
  advantages!: string;

  @ApiProperty({
    example: 'Высокая цена',
    description: 'Недостатки товара',
  })
  flaws!: string;

  @ApiProperty({
    example: 'Пользуюсь уже месяц, батарею держат отлично, звук супер!',
    description: 'Текст отзыва',
  })
  comment!: string;

  @ApiProperty({
    example: true,
    description: 'Подтвержденная покупка на маркетплейсе',
  })
  isVerified!: boolean;

  @ApiProperty({
    enum: ReviewStatus,
    example: ReviewStatus.PUBLISHED,
    description: 'Статус отзыва',
  })
  status!: ReviewStatus;

  @ApiPropertyOptional({
    example: 'Спасибо за отзыв! Приятного пользования.',
    description: 'Ответ продавца на отзыв',
    nullable: true,
  })
  replyComment?: string | null;

  @ApiPropertyOptional({
    example: '2026-09-11T10:00:00.000Z',
    description: 'Дата ответа продавца',
    nullable: true,
  })
  repliedAt?: Date | null;

  @ApiPropertyOptional({
    example: '0191e4b3-764a-7182-93cb-5690b2b8da99',
    description: 'ID заказа',
    nullable: true,
  })
  orderId?: string | null;

  @ApiProperty({ example: '2026-09-10T14:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-10T14:30:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: ReviewUserDto, description: 'Автор отзыва' })
  user!: ReviewUserDto;

  @ApiProperty({ type: ReviewProductDto, description: 'Товар' })
  product!: ReviewProductDto;

  @ApiPropertyOptional({
    type: ReviewVariantDto,
    description: 'Выбранная модификация товара',
    nullable: true,
  })
  variant?: ReviewVariantDto | null;
}

export class PartnerReviewsPaginationDto {
  @ApiProperty({ example: 48, description: 'Всего отзывов по фильтру' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Текущая страница' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Элементов на странице' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Всего страниц' })
  totalPages!: number;

  @ApiProperty({ example: false, description: 'Есть ли предыдущая страница' })
  hasPrevPage!: boolean;

  @ApiProperty({ example: true, description: 'Есть ли следующая страница' })
  hasNextPage!: boolean;
}

export class PartnerReviewsListResponseDto {
  @ApiProperty({
    type: [PartnerReviewItemDto],
    description: 'Список отзывов',
  })
  items!: PartnerReviewItemDto[];

  @ApiProperty({
    type: PartnerReviewsPaginationDto,
    description: 'Метаданные пагинации',
  })
  pagination!: PartnerReviewsPaginationDto;
}
