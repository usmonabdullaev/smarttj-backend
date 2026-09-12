import { ApiProperty } from '@nestjs/swagger';

export class AdminModelResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Galaxy S24 Ultra' })
  name!: string;

  @ApiProperty({ example: 'galaxy-s24-ultra' })
  slug!: string;

  @ApiProperty({
    nullable: true,
    example: 'Флагманская модель 2024 года',
  })
  description!: string | null;

  @ApiProperty({
    nullable: true,
    example: 'https://res.cloudinary.com/.../model.png',
  })
  image!: string | null;

  @ApiProperty({ nullable: true, example: 'model/image_123' })
  imageId!: string | null;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  brandId!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: true })
  popular!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
