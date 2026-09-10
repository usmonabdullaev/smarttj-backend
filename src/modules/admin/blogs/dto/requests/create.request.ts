import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'BlogCreateRequest' })
export class CreateRequest {
  @ApiProperty({ example: 'blog-1' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Blog title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Blog content' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 'Гайды' })
  @IsString()
  @IsNotEmpty()
  tag!: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  readingTime!: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Blog banner',
  })
  banner!: Express.Multer.File;
}
