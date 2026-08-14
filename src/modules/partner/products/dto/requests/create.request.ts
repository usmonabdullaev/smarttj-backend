import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

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

export class CreateProductDto {
  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsUUID(7)
  categoryId?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
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
