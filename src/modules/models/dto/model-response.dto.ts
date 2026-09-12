import { ApiProperty } from '@nestjs/swagger';

export class ModelResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Samsung' })
  name!: string;

  @ApiProperty({ example: 'samsung' })
  slug!: string;

  @ApiProperty({
    nullable: true,
    example: 'Description of the model',
  })
  description?: string | null;

  @ApiProperty({
    nullable: true,
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/model/mpmezwvtg0drxtllmm7a.png',
  })
  image?: string | null;

  @ApiProperty({
    nullable: true,
    example: 'model/mpmezwvtg0drxtllmm7a',
  })
  imageId?: string | null;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  brandId!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: true })
  popular!: boolean;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt!: string;
}
