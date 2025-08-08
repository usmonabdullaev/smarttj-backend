import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Ноутбуки', description: 'Название категории' })
  name: string;

  @ApiProperty({ example: 'laptops', description: 'Slug категории' })
  slug: string;

  icon?: string;

  @ApiProperty({
    example: null,
    description: 'ID верхнего категории',
    required: false,
  })
  parentId?: string | null;
}
