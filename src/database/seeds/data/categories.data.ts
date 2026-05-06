import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';

export class CreateCategoriesDto extends CreateCategoryDto {
  children?: CreateCategoriesDto[];
}

export const CATEGORIES: CreateCategoriesDto[] = [
  {
    name: 'Смартфоны и фототехника',
    short_name: 'Смартфоны и фототехника',
    slug: 'smartfony-i-fototexnika',
    order: 1,
    children: [
      {
        name: 'Смартфоны и гаджеты',
        short_name: 'Смартфоны и гаджеты',
        slug: 'smartfony-i-gadzhety',
        order: 1,
        children: [
          {
            name: 'Смартфоны',
            short_name: 'Смартфоны',
            slug: 'smartfony',
            order: 1,
          },
          {
            name: 'Смарт-часы и браслеты',
            short_name: 'Смарт-часы и браслеты',
            slug: 'smart-chasy-i-braslety',
            order: 2,
          },
        ],
      },
      {
        name: 'Планшеты, электронные книги',
        short_name: 'Планшеты, электронные книги',
        slug: 'planshety-elektronnye-knigi',
        order: 2,
        children: [
          {
            name: 'Планшеты',
            short_name: 'Планшеты',
            slug: 'planshety',
            order: 1,
          },
        ],
      },
    ],
  },
  {
    name: 'ПК, ноутбуки, периферия',
    short_name: 'ПК, ноутбуки, периферия',
    slug: 'pk-noutbuki-periferiya',
    order: 2,
    children: [
      {
        name: 'Ноутбуки и аксессуары',
        short_name: 'Ноутбуки и аксессуары',
        slug: 'noutbuki-i-aksessuary',
        order: 1,
        children: [
          {
            name: 'Ноутбуки',
            short_name: 'Ноутбуки',
            slug: 'noutbuki',
            order: 1,
          },
        ],
      },
    ],
  },
];
