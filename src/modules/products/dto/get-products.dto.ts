import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
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
