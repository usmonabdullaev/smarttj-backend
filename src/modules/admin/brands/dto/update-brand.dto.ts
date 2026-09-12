import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminUpdateBrandDto {
  @ApiPropertyOptional({
    example: 'Apple Inc.',
    description: 'Название бренда',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'apple', description: 'URL-slug бренда' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 1, description: 'Порядок сортировки' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true, description: 'Популярный бренд' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Логотип бренда (файл)',
  })
  @IsOptional()
  logo?: any;
}
