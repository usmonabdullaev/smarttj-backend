import { ApiProperty } from '@nestjs/swagger';

export class AdminBrandResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Apple' })
  name!: string;

  @ApiProperty({ example: 'apple' })
  slug!: string;

  @ApiProperty({
    nullable: true,
    example: 'https://res.cloudinary.com/.../logo.png',
  })
  logo!: string | null;

  @ApiProperty({ nullable: true, example: 'brand/logo_123' })
  logoId!: string | null;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: true })
  popular!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
