import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { BannerPosition } from '@prisma/client';
import type { Express } from 'express';

@ApiSchema({ name: 'BannerUpdateRequest' })
export class UpdateRequest {
  @ApiPropertyOptional({
    example: 'Banner',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    enum: BannerPosition,
    example: 'MAIN',
    default: 'MAIN',
  })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({
    example: 'Banner description',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: '/category/new',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Banner image',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
