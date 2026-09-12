import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminGetBrandsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'apple', description: 'Поисковый запрос' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: true, description: 'Фильтр по популярности' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  popular?: boolean;
}
