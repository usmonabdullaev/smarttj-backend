import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AdminUpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Электроника и гаджеты',
    description: 'Название категории',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Электроника',
    description: 'Короткое название категории',
  })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiPropertyOptional({
    example: 'elektronika',
    description: 'URL-slug категории',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
    description:
      'ID родительской категории (передайте null для переноса в корень)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

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
    description: 'Новая иконка категории (файл)',
  })
  @IsOptional()
  icon?: any;
}
