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
} from 'class-validator';

class UpdateProductVariantAttributesDto {
  @ApiProperty({ example: 'ID' })
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
  @Max(999_999_999_999)
  price?: number;

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    type: UpdateProductVariantAttributesDto,
  })
  @IsOptional()
  @IsArray()
  attributes?: UpdateProductVariantAttributesDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
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
