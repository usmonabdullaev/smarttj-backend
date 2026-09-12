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

export class AdminCreateRegionDto {
  @ApiProperty({ example: 'Душанбе', description: 'Название региона / города' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    example: 'dushanbe',
    description:
      'URL-слаг региона (генерируется автоматически, если не указан)',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Порядковый номер для сортировки',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number = 1;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description:
      'ID родительского региона (если это район или город внутри области)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Является ли регионом по умолчанию',
  })
  @IsOptional()
  @IsBoolean()
  default?: boolean = false;
}
