import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAttributeGroupDto {
  @ApiProperty({
    example: 'Экран и дисплей',
    description: 'Название группы характеристик',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

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
}

export class UpdateAttributeGroupDto {
  @ApiPropertyOptional({ example: 'Экран и дисплей' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number;
}
