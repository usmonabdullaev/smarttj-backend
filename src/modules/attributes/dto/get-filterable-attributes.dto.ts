import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetFilterableAttributesQueryDto {
  @ApiPropertyOptional({
    description:
      'ID или Slug категории (опционально). Если передан, возвращает фильтруемые атрибуты для данной категории, её родителей, дочерних категорий и общие (глобальные) атрибуты.',
    example: 'smartfony',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
