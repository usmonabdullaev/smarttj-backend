import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class FavoriteCategoryDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000010' })
  id!: string;

  @ApiProperty({ example: 'Смартфоны' })
  name!: string;

  @ApiProperty({ example: 'smartfony' })
  slug!: string;
}

export class FavoriteBrandDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000020' })
  id!: string;

  @ApiProperty({ example: 'Apple' })
  name!: string;

  @ApiProperty({ example: 'apple' })
  slug!: string;
}

export class FavoriteVariantSummaryDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000002' })
  id!: string;

  @ApiProperty({ example: 12000 })
  price!: number;

  @ApiPropertyOptional({ example: 11000 })
  discount?: number | null;

  @ApiProperty({ example: 15 })
  stock!: number;

  @ApiPropertyOptional({ example: 'Черный / 256GB' })
  label?: string | null;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image.jpg' })
  imageUrl?: string | null;
}

export class FavoriteProductDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000001' })
  id!: string;

  @ApiProperty({ example: 'Apple iPhone 15 Pro' })
  title!: string;

  @ApiProperty({ example: 'apple-iphone-15-pro' })
  slug!: string;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 35 })
  reviewsCount!: number;

  @ApiProperty({ example: 12000, description: 'Минимальная цена среди вариантов товара' })
  minPrice!: number;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image.jpg' })
  mainImage?: string | null;

  @ApiPropertyOptional({ type: FavoriteCategoryDto })
  category?: FavoriteCategoryDto | null;

  @ApiPropertyOptional({ type: FavoriteBrandDto })
  brand?: FavoriteBrandDto | null;

  @ApiProperty({ type: [FavoriteVariantSummaryDto] })
  variants!: FavoriteVariantSummaryDto[];
}

export class FavoriteItemDto {
  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000030' })
  id!: string;

  @ApiProperty({ example: '0192e21b-68d1-7000-8000-000000000001' })
  productId!: string;

  @ApiPropertyOptional({ example: '0192e21b-68d1-7000-8000-000000000002' })
  productVariantId?: string | null;

  @ApiProperty({ example: '2026-09-13T20:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: FavoriteProductDto })
  product!: FavoriteProductDto;

  @ApiPropertyOptional({ type: FavoriteVariantSummaryDto })
  variant?: FavoriteVariantSummaryDto | null;
}

export class FavoritesPaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 45 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class FavoritesListResponseDto {
  @ApiProperty({ type: [FavoriteItemDto] })
  items!: FavoriteItemDto[];

  @ApiProperty({ type: FavoritesPaginationDto })
  pagination!: FavoritesPaginationDto;
}

export class ToggleFavoriteResponseDto {
  @ApiProperty({ example: true, description: 'true - добавлен в избранное, false - удален' })
  isFavorite!: boolean;

  @ApiProperty({ example: 'Товар добавлен в избранное' })
  message!: string;
}

export class FavoriteIdsResponseDto {
  @ApiProperty({
    example: [
      '0192e21b-68d1-7000-8000-000000000001',
      '0192e21b-68d1-7000-8000-000000000002',
    ],
    type: [String],
    description: 'Массив UUID всех товаров в избранном у пользователя',
  })
  ids!: string[];
}

export class CheckFavoriteResponseDto {
  @ApiProperty({ example: true })
  isFavorite!: boolean;
}

