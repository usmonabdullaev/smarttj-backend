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

export class CreateBrandDto {
  @ApiProperty({
    example: 'Samsung',
    description: 'Название бренда',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'samsung',
    description: 'Уникальный slug бренда (используется в URL)',
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Логотип бренда (файл изображения)',
  })
  @IsOptional()
  logo?: string; // тип `any`, чтобы Swagger правильно отобразил input type="file"

  @ApiPropertyOptional({
    example: 1,
    description: 'Порядок отображения бренда',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  order?: number;

  @ApiProperty({
    example: true,
    description: 'Отображать бренд как популярный',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  popular!: boolean;
}
