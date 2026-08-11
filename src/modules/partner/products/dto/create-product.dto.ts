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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ example: 1600000 })
  @IsInt()
  @Min(0)
  @Max(999_999_999_999)
  price!: number;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(1)
  @Max(999_999_999_999)
  stock!: number;
}

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

export class CreateProductDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  warranty?: number;

  @ApiPropertyOptional({ example: '019c02af-ac6a-7066-9a0e-5cd332e41a9f' })
  @IsOptional()
  @IsUUID(7)
  brandId?: string;

  @ApiPropertyOptional({ example: '019c02af-ac6f-74ab-9108-7e4f5f473b58' })
  @IsOptional()
  @IsUUID(7)
  modelId?: string;

  @ApiPropertyOptional({ example: '019bdffb-8ca1-7065-9b3f-0fcdd97376bf' })
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

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  warranty?: number;

  @ApiPropertyOptional({ example: '019bdffb-8ca1-7065-9b3f-0fcdd97376bf' })
  @IsOptional()
  @IsUUID(7)
  categoryId?: string;

  @ApiPropertyOptional({ example: '019c02af-ac6a-7066-9a0e-5cd332e41a9f' })
  @IsOptional()
  @IsUUID(7)
  brandId?: string;

  @ApiPropertyOptional({ example: '019c02af-ac6f-74ab-9108-7e4f5f473b58' })
  @IsOptional()
  @IsUUID(7)
  modelId?: string;

  @ApiPropertyOptional({ example: '019bdffb-8ca1-7065-9b3f-0fcdd97376bf' })
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

export class PublishProductDto {
  @ApiProperty({ example: 'Product title' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Product description' })
  @IsString()
  description!: string;
}

export interface UploadImageDto {
  url: string;
  urlId: string;
  order?: number;
}
