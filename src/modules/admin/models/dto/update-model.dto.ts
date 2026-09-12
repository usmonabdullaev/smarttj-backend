import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AdminUpdateModelDto {
  @ApiPropertyOptional({
    example: 'Galaxy S24 Ultra',
    description: 'Название модели',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description: 'ID бренда',
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({
    example: 'galaxy-s24-ultra',
    description: 'URL-slug модели',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Флагманская модель 2024 года',
    description: 'Описание модели',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Порядок сортировки' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true, description: 'Популярная модель' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Изображение модели (файл)',
  })
  @IsOptional()
  image?: any;
}
