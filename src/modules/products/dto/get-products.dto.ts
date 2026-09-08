import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
}
