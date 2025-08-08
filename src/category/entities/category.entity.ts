import { ApiProperty } from '@nestjs/swagger';

import { Category as PrismaCategory } from 'generated/prisma';

export class Category implements PrismaCategory {
  @ApiProperty({
    example: '01988892-b920-7482-a6c8-04bdf418bf16',
    description: 'ID категории',
  })
  id: string;

  @ApiProperty({ example: 'Ноутбуки', description: 'Название категории' })
  name: string;

  @ApiProperty({ example: 'laptops', description: 'Slug категории' })
  slug: string;

  @ApiProperty({ example: 1, description: 'Slug категории' })
  order: number;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1754638179/Anonymous_k1oyih.png',
    description: 'Slug категории',
    required: false,
  })
  icon: string | null;

  @ApiProperty({
    example: '01988892-b920-7482-a6c8-04bdf418bf16',
    description: 'ID верхнего категория',
    required: false,
  })
  parentId: string | null;

  @ApiProperty({
    example: '2025-08-08 13:05:23.190326+05',
    description: 'Дата создания категория',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-08 13:05:23.190326+05',
    description: 'Дата обновления категория',
  })
  updatedAt: Date;
}

export class ConflictRes {
  @ApiProperty({
    example: 'Конфликт данных',
    description: 'Конфликт данных',
  })
  message: string;

  @ApiProperty({
    example: {},
    description: 'Подробности ошибку',
  })
  error: any;
}
