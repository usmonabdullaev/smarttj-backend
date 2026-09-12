import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AdminCreateBrandDto {
  @ApiProperty({ example: 'Apple', description: 'Название бренда' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'apple',
    description:
      'URL-slug бренда (генерируется автоматически, если не передан)',
  })
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
