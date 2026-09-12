import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAdminAttributeDto {
  @ApiProperty({
    example: 'Встроенная память',
    description: 'Название характеристики',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    enum: AttributeType,
    example: AttributeType.SELECT,
    description:
      'Тип характеристики: STRING, NUMBER, BOOLEAN, SELECT, MULTISELECT',
  })
  @IsNotEmpty()
  @IsEnum(AttributeType)
  type!: AttributeType;

  @ApiPropertyOptional({
    example: 'ГБ',
    description: 'Единица измерения (ГБ, МГц, мм, кг и т.д.)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  unit?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description: 'ID категории (если привязан к конкретной категории)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    description: 'ID группы характеристик (например, "Память", "Экран")',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  groupId?: string | null;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Является ли обязательной для заполнения партнером',
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Доступна ли в фильтрах каталога для покупателей',
  })
  @IsOptional()
  @IsBoolean()
  filterable?: boolean = false;

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
    example: ['128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ'],
    description:
      'Опциональный список начальных строковых значений для быстрого создания вариантов',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  initialValues?: string[];
}

export class UpdateAdminAttributeDto {
  @ApiPropertyOptional({ example: 'Встроенная память' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: AttributeType })
  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @ApiPropertyOptional({ example: 'ГБ', nullable: true })
  @IsOptional()
  @IsString()
  unit?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  groupId?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  filterable?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number;
}
