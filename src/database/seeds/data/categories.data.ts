import { CreateAttributeDto } from '../../../modules/attributes/dto/create-attribute.dto';
import { CreateCategoryDto } from '../../../modules/categories/dto/create-category.dto';

export class CreateCategoriesDto extends CreateCategoryDto {
  children?: CreateCategoriesDto[];
  attributes?: CreateAttributeDto[];
}

export const CATEGORIES: CreateCategoriesDto[] = [
  {
    name: 'Смартфоны',
    short_name: 'Смартфоны',
    slug: 'smartfony',
    order: 1,
    attributes: [
      {
        name: 'Оперативная память',
        type: 'SELECT',
        unit: 'ГБ',
        required: true,
        filterable: true,
        order: 1,
        values: [
          {
            valueNumber: 4,
            label: '4',
          },
          {
            valueNumber: 6,
            label: '6',
          },
          {
            valueNumber: 8,
            label: '8',
          },
          {
            valueNumber: 12,
            label: '12',
          },
          {
            valueNumber: 16,
            label: '16',
          },
        ],
      },
    ],
  },
  {
    name: 'Ноутбуки',
    short_name: 'Ноутбуки',
    slug: 'noutbuki',
    order: 2,
  },
  {
    name: 'Телевизоры',
    short_name: 'Телевизоры',
    slug: 'televizory',
    order: 3,
  },
  {
    name: 'Бытовая техника',
    short_name: 'Бытовая техника',
    slug: 'bytovaya-tehnika',
    order: 4,
  },
];
