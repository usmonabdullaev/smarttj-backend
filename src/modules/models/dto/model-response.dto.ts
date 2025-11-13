import { ApiProperty } from '@nestjs/swagger';

export class ModelResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id: string;

  @ApiProperty({ example: 'Samsung' })
  name: string;

  @ApiProperty({ example: 'samsung' })
  slug: string;

  @ApiProperty({
    nullable: true,
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/brand/mpmezwvtg0drxtllmm7a.png',
  })
  logo: string;

  @ApiProperty({
    nullable: true,
    example: 'brand/mpmezwvtg0drxtllmm7a',
  })
  logoId: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  popular: boolean;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt: string;
}
