import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id: string;

  @ApiProperty({ example: 'Phone' })
  name: string;

  @ApiProperty({ example: 'Phone' })
  short_name: string;

  @ApiProperty({ example: 'phone' })
  slug: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({
    nullable: true,
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/category/mpmezwvtg0drxtllmm7a.png',
  })
  icon: string;

  @ApiProperty({
    nullable: true,
    example: 'category/mpmezwvtg0drxtllmm7a',
  })
  iconId: string;

  @ApiProperty({
    nullable: true,
    example: '019a6263-6f97-7230-8449-e979b855ada1',
  })
  parentId: string;

  @ApiProperty({ example: 'ROOT' })
  parentKey: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt: string;
}

export class CategoryItemsResponseDto extends CategoryResponseDto {
  @ApiProperty({
    type: CategoryResponseDto,
    isArray: true,
  })
  children: CategoryResponseDto[];
}

export class CategoryWithLevelResponseDto extends CategoryResponseDto {
  @ApiProperty({ example: 1 })
  level: number;
}

export class CategoriesTreeResponseDto extends CategoryWithLevelResponseDto {
  @ApiProperty({
    type: CategoryWithLevelResponseDto,
    isArray: true,
  })
  children: CategoryWithLevelResponseDto[];
}
