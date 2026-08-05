import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'price-asc' })
  @IsOptional()
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new';

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  rating?: 1 | 2 | 3 | 4 | 5;
}
