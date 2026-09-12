import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetProductBlocksQueryDto {
  @ApiPropertyOptional({
    example: 8,
    description:
      'Количество товаров в каждом блоке (по умолчанию 8, максимум 20)',
    default: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 8;

  @ApiPropertyOptional({
    example: 4,
    description: 'Количество категорийных блоков (по умолчанию 4, максимум 10)',
    default: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  categoriesLimit: number = 4;
}
