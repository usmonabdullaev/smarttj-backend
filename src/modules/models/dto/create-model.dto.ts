import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateModelDto {
  @ApiProperty({
    example: 'Samsung',
    description: 'Название моделя',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'samsung',
    description: 'Уникальный slug моделя (используется в URL)',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    example: 'Samsung',
    description: 'Название моделя',
  })
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Картинка моделя (файл изображения)',
  })
  @IsOptional()
  image?: string; // тип `any`, чтобы Swagger правильно отобразил input type="file"

  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description: 'ID бренда',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Порядок отображения моделя',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Отображать модел как популярный',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  popular: boolean;
}
