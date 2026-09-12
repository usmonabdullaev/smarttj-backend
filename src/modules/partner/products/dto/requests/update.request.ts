import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateProductVariantAttributesDto {
  @ApiPropertyOptional({ example: 'ID' })
  @IsUUID(7)
  attributeId!: string;

  @ApiPropertyOptional({
    example: 'ID',
  })
  @IsOptional()
  @IsUUID(7)
  attributeValueId?: string;

  @ApiPropertyOptional({
    example: 'string',
  })
  @IsOptional()
  @IsString()
  valueString?: string;

  @ApiPropertyOptional({
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  valueNumber?: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;

  @ApiPropertyOptional({
    example: 'Label',
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  price?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  stock?: number;

  @ApiPropertyOptional({ example: 10, description: 'Процент скидки (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiPropertyOptional({
    example: '8/256GB Black',
    description: 'Метка/название варианта',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: UpdateProductVariantAttributesDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantAttributesDto)
  attributes?: UpdateProductVariantAttributesDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  warranty?: number;

  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  categoryId?: string;

  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  brandId?: string;

  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  modelId?: string;

  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  regionId?: string;

  @ApiPropertyOptional({ example: 'Product title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'slug' })
  @IsOptional()
  @IsString()
  slug?: string;
}
