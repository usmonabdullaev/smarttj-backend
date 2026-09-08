import { BannerPosition } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BannerResponse {
  @ApiProperty({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  id!: string;

  @ApiProperty({ example: 'Banner title' })
  title!: string;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2025-11-08T07:34:35.160Z',
  })
  updatedAt!: string;

  @ApiProperty({
    example: 'https://example.com',
  })
  url!: string;

  @ApiProperty({
    example: 'Banner description',
  })
  description!: string;

  @ApiProperty({
    example: 'MAIN',
    enum: BannerPosition,
  })
  position!: BannerPosition;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/banner/mpmezwvtg0drxtllmm7a.png',
    nullable: true,
  })
  image!: string | null;

  @ApiProperty({
    example: 'banner/mpmezwvtg0drxtllmm7a',
    nullable: true,
  })
  imageId!: string | null;
}
