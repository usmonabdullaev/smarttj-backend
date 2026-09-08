import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { BannerPosition } from '@prisma/client';
import type { Express } from 'express';

@ApiSchema({ name: 'BannerCreateRequest' })
export class CreateRequest {
  @ApiProperty({ example: 'Banner' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    enum: BannerPosition,
    example: 'MAIN',
    default: 'MAIN',
  })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiProperty({ example: 'Banner description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: '/category/new' })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Banner image',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
