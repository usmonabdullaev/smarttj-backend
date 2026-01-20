import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Смартфоны',
    description: 'Название категории',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Смартфоны',
    description: 'Краткое название категории',
  })
  @IsString()
  @IsNotEmpty()
  short_name: string;

  @ApiProperty({
    example: 'smartfoni',
    description: 'Уникальный slug',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsBoolean()
  order?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'файл',
  })
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
