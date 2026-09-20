import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000)
  limit?: number;

  @ApiPropertyOptional({
    example: 'price-asc',
    description: 'Order products',
    enum: ['popular', 'price-asc', 'price-desc', 'rating', 'new'],
  })
  @IsOptional()
  @IsEnum(['popular', 'price-asc', 'price-desc', 'rating', 'new'])
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new';

  @ApiPropertyOptional({
    description: 'Filter by rating',
    minimum: 1,
    maximum: 5,
    type: 'number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: 1 | 2 | 3 | 4 | 5;

  @ApiPropertyOptional({
    example: '',
    description: 'Search input',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    example: 'ID',
    description: 'Filter by brand ID',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Minimum price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Maximum price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'ID-или-slug',
    description: 'Filter by category ID or slug',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: ['val-id-1', 'val-id-2'],
    description:
      'Фильтр по ID значений атрибутов (AttributeValue ID). Можно передавать массив (?attributeValueIds=1&attributeValueIds=2) или через запятую (?attributeValueIds=1,2)',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return [trimmed];
        }
      }
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [value];
  })
  @IsArray()
  @IsString({ each: true })
  attributeValueIds?: string[];

  @ApiPropertyOptional({
    example: '{"attr-id-1":["val-id-1","val-id-2"]}',
    description:
      'Фильтр по атрибутам в виде JSON-объекта { [attributeId]: valueId | valueId[] }',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  @IsObject()
  attributes?: Record<string, string[] | string>;
}
