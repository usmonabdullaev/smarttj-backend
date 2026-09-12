import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminRegionResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Душанбе' })
  title!: string;

  @ApiProperty({ example: 'dushanbe' })
  slug!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId?: string | null;

  @ApiProperty({ example: true })
  default!: boolean;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: Object, nullable: true })
  parent?: any;

  @ApiPropertyOptional({ type: [Object] })
  children?: any[];

  @ApiPropertyOptional({
    example: { users: 120, products: 450, adresses: 85 },
    description: 'Количество связанных сущностей',
  })
  _count?: {
    users?: number;
    products?: number;
    adresses?: number;
    children?: number;
  };
}
