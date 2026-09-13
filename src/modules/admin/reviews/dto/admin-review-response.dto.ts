import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class AdminReviewUserDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Алишер С.' })
  name!: string;

  @ApiPropertyOptional({ example: '+992900000000' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string | null;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/avatar.jpg',
  })
  avatar?: string | null;
}

export class AdminReviewPartnerDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000005' })
  id!: string;

  @ApiProperty({ example: 'ООО Электроника Плюс' })
  storeName!: string;
}

export class AdminReviewProductDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000002' })
  id!: string;

  @ApiProperty({ example: 'Apple iPhone 15 Pro 128GB' })
  title!: string;

  @ApiProperty({ example: 'apple-iphone-15-pro-128gb' })
  slug!: string;

  @ApiPropertyOptional({ type: AdminReviewPartnerDto })
  partner?: AdminReviewPartnerDto | null;
}

export class AdminReviewVariantDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000003' })
  id!: string;

  @ApiProperty({ example: 'Титановый синий' })
  label!: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/img.jpg' })
  imageUrl?: string | null;
}

export class AdminReviewItemDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000004' })
  id!: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiPropertyOptional({ example: 'Отличный телефон' })
  advantages?: string | null;

  @ApiPropertyOptional({ example: 'Дорого' })
  flaws?: string | null;

  @ApiPropertyOptional({ example: 'Быстрая доставка, оригинал.' })
  comment?: string | null;

  @ApiProperty({
    example: ['https://res.cloudinary.com/demo/img.jpg'],
    type: [String],
  })
  images!: string[];

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.PUBLISHED })
  status!: ReviewStatus;

  @ApiPropertyOptional({ example: 'Спасибо за покупку!' })
  replyComment?: string | null;

  @ApiPropertyOptional({ example: '2026-09-13T10:00:00.000Z' })
  repliedAt?: Date | null;

  @ApiProperty({ example: 3 })
  likesCount!: number;

  @ApiPropertyOptional({ example: '0192e21b-68d1-7000-8000-000000000006' })
  orderId?: string | null;

  @ApiProperty({ example: '2026-09-13T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-13T09:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: AdminReviewUserDto })
  user!: AdminReviewUserDto;

  @ApiProperty({ type: AdminReviewProductDto })
  product!: AdminReviewProductDto;

  @ApiPropertyOptional({ type: AdminReviewVariantDto })
  variant?: AdminReviewVariantDto | null;
}

export class AdminReviewsPaginationDto {
  @ApiProperty({ example: 120 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 6 })
  totalPages!: number;
}

export class AdminReviewsListResponseDto {
  @ApiProperty({ type: [AdminReviewItemDto] })
  items!: AdminReviewItemDto[];

  @ApiProperty({ type: AdminReviewsPaginationDto })
  pagination!: AdminReviewsPaginationDto;
}
