import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantAttributeDto {
  @ApiProperty({ example: 'ID' })
  @IsUUID(7)
  attributeId!: string;

  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  attributeValueId?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  valueString?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  valueNumber?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;

  @ApiPropertyOptional({ example: 'Label' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class CreateProductVariantDto {
  @ApiProperty({ example: 1600000 })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  price!: number;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  stock!: number;

  @ApiPropertyOptional({
    isArray: true,
    type: CreateProductVariantAttributeDto,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantAttributeDto)
  attributes?: CreateProductVariantAttributeDto[];
}

export class CreateProductDto {
  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  categoryId?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  warranty?: number;

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

  @ApiProperty({ example: 'Product title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'slug' })
  @IsOptional()
  @IsString()
  slug?: string;
}
