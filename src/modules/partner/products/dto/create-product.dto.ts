import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  @Max(999_999_999_999)
  price!: number;
}

export class CreateProductDto {
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
}

export class PublishProductDto {
  title!: string;
  description!: string;
}

export interface UploadImageDto {
  url: string;
  urlId: string;
  order?: number;
}
