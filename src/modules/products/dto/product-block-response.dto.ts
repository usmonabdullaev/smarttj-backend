import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductBlockCategoryDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Смартфоны' })
  name!: string;

  @ApiProperty({ example: 'smartfony' })
  slug!: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/category/phone.png',
    nullable: true,
  })
  icon!: string | null;
}

export class ProductBlockDto {
  @ApiProperty({
    example: 'bestsellers',
    description: 'Уникальный идентификатор блока',
  })
  id!: string;

  @ApiProperty({
    example: 'Хиты продаж',
    description: 'Заголовок блока для отображения',
  })
  title!: string;

  @ApiPropertyOptional({
    example: 'Самые популярные товары',
    description: 'Подзаголовок блока',
    nullable: true,
  })
  subtitle?: string;

  @ApiProperty({
    example: 'bestsellers',
    description:
      'Тип блока: bestsellers (хиты), new (новинки), discounts (скидки), top_rated (высокий рейтинг), category (категорийный)',
  })
  type!: string;

  @ApiPropertyOptional({
    type: ProductBlockCategoryDto,
    nullable: true,
    description: 'Данные категории, если тип блока "category"',
  })
  category?: ProductBlockCategoryDto | null;

  @ApiProperty({
    description:
      'Массив вариантов товаров блока (с вложенными product, images, attributes)',
    type: [Object],
  })
  items!: any[];
}
