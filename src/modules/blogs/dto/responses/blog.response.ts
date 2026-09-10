import { ApiProperty } from '@nestjs/swagger';

export class BlogResponse {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'blog-1' })
  slug!: string;

  @ApiProperty({ example: 'Blog title' })
  title!: string;

  @ApiProperty({ example: 'Blog content' })
  content!: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/blog/mpmezwvtg0drxtllmm7a.png',
  })
  banner!: string;

  @ApiProperty({ example: 'blog/mpmezwvtg0drxtllmm7a' })
  bannerId!: string;

  @ApiProperty({ example: 'Гайды' })
  tag!: string;

  @ApiProperty({ example: 5 })
  readingTime!: number;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt!: string;
}
