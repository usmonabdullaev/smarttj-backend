import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

@ApiSchema({ name: 'AdminProductGetAllRequest' })
export class GetAllRequest {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 1_000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000)
  limit?: number;

  @ApiPropertyOptional({ example: 'Samsung', minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  q?: string;

  @ApiPropertyOptional({ enum: ProductStatus, example: 'ACTIVE' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
