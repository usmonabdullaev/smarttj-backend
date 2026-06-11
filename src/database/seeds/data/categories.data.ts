import { CreateCategoryDto } from '../../../modules/categories/dto/create-category.dto';

export class CreateCategoriesDto extends CreateCategoryDto {
  children?: CreateCategoriesDto[];
}

export const CATEGORIES: CreateCategoriesDto[] = [
  {
    name: 'Смартфоны',
    short_name: 'Смартфоны',
    slug: 'smartfony',
    order: 1,
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
