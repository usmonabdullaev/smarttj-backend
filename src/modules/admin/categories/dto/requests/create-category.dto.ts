import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AdminCreateCategoryDto {
  @ApiProperty({ example: 'Электроника', description: 'Название категории' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'Электроника',
    description: 'Короткое название категории (по умолчанию совпадает с name)',
  })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiPropertyOptional({
    example: 'elektronika',
    description:
      'URL-slug категории (генерируется автоматически, если не указан)',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description:
      'ID родительской категории (null/не указано для корневой категории)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Порядок сортировки',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Иконка/изображение категории (файл)',
  })
  @IsOptional()
  icon?: any;
}
