import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCategoryResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Электроника' })
  name!: string;

  @ApiProperty({ example: 'Электроника' })
  short_name!: string;

  @ApiProperty({ example: 'elektronika' })
  slug!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({
    nullable: true,
    example: 'https://res.cloudinary.com/.../icon.png',
  })
  icon!: string | null;

  @ApiProperty({ nullable: true, example: 'category/icon_123' })
  iconId!: string | null;

  @ApiProperty({
    nullable: true,
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  parentId!: string | null;

  @ApiProperty({ example: 'ROOT' })
  parentKey!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional()
  parent?: any;

  @ApiPropertyOptional({ isArray: true })
  children?: any[];

  @ApiPropertyOptional()
  _count?: {
    products?: number;
    children?: number;
    attributes?: number;
  };
}
