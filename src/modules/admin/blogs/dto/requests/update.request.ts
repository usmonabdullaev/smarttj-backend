import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'BlogUpdateRequest' })
export class UpdateRequest {
  @ApiPropertyOptional({ example: 'blog-1' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Blog title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Blog content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'Гайды' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readingTime?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Blog banner',
  })
  @IsOptional()
  banner?: Express.Multer.File;
}
