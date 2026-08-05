import { ApiProperty } from '@nestjs/swagger';

class ProductVariantDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 10000 })
  price!: number;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  productId!: string;

  @ApiProperty({ example: 1, description: 'Код товара' })
  code!: number;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt!: string;

  @ApiProperty({
    example: [
      {
        id: '019a6263-6f97-7230-8449-e979b855ada1',
        productVariantId: '019a6263-6f97-7230-8449-e979b855ada1',
        url: 'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/image/mpmezwvtg0drxtllmm7a.png',
        urlId: 'image/mpmezwvtg0drxtllmm7a',
        alt: 'Samsung A56',
        order: 1,
        createdAt: '2025-11-08T07:34:35.160Z',
        updatedAt: '2025-11-08T07:34:35.160Z',
      },
    ],
  })
  images: any;

  @ApiProperty({
    example: [
      {
        id: '019a6263-6f97-7230-8449-e979b855ada1',
        attributeId: '019a6263-6f97-7230-8449-e979b855ada1',
        productId: '019a6263-6f97-7230-8449-e979b855ada1',
        attributeValueId: '019a6263-6f97-7230-8449-e979b855ada1',
        productVariantId: '019a6263-6f97-7230-8449-e979b855ada1',
        createdAt: '2025-11-08T07:34:35.160Z',
        updatedAt: '2025-11-08T07:34:35.160Z',
        attribute: {
          id: '019a6263-6f97-7230-8449-e979b855ada1',
          name: 'Цвет',
          slug: 'tsvet',
          type: 'Type',
          groupId: '019a6263-6f97-7230-8449-e979b855ada1',
          filterable: true,
          order: 1,
          createdAt: '2025-11-08T07:34:35.160Z',
          updatedAt: '2025-11-08T07:34:35.160Z',
        },
        attributeValue: {
          id: '019a6263-6f97-7230-8449-e979b855ada1',
          attributeId: '019a6263-6f97-7230-8449-e979b855ada1',
          value: 'Черный',
          createdAt: '2025-11-08T07:34:35.160Z',
          updatedAt: '2025-11-08T07:34:35.160Z',
        },
      },
    ],
  })
  attributes: any;
}

class ResponseListMetaDto {
  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    example: 56,
  })
  total!: number;

  @ApiProperty({
    example: 3,
  })
  totalPages!: number;
}

export class ProductResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Samsung' })
  title!: string;

  @ApiProperty({ example: 10000, nullable: true })
  price!: number;

  @ApiProperty({
    example: 'Product description',
  })
  description!: string;

  @ApiProperty({
    nullable: true,
    example: 12,
  })
  warranty!: number;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  categoryId!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  brandId!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  modelId!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  regionId!: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt!: string;

  @ApiProperty({
    example: {
      id: '019a6263-6f97-7230-8449-e979b855ada1',
      name: 'Phone',
      slug: 'phone',
      order: 1,
      icon: 'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/category/mpmezwvtg0drxtllmm7a.png',
      iconId: 'category/mpmezwvtg0drxtllmm7a',
      parentId: '019a6263-6f97-7230-8449-e979b855ada1',
      createdAt: '2025-11-08T07:34:35.160Z',
      updatedAt: '2025-11-08T07:34:35.160Z',
    },
  })
  category: any;

  @ApiProperty({
    example: {
      id: '019a6263-6f97-7230-8449-e979b855ada1',
      name: 'Samsung',
      slug: 'samsung',
      logo: 'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/brand/mpmezwvtg0drxtllmm7a.png',
      logoId: 'brand/mpmezwvtg0drxtllmm7a',
      order: 1,
      popular: true,
      createdAt: '2025-11-08T07:34:35.160Z',
      updatedAt: '2025-11-08T07:34:35.160Z',
    },
  })
  brand: any;

  @ApiProperty({
    example: {
      id: '019a6263-6f97-7230-8449-e979b855ada1',
      name: 'A',
      slug: 'a',
      description: 'Model description',
      image:
        'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/model/mpmezwvtg0drxtllmm7a.png',
      imageId: 'model/mpmezwvtg0drxtllmm7a',
      brandId: '019a6263-6f97-7230-8449-e979b855ada1',
      order: 1,
      popular: true,
      createdAt: '2025-11-08T07:34:35.160Z',
      updatedAt: '2025-11-08T07:34:35.160Z',
    },
  })
  model: any;

  @ApiProperty({
    example: {
      id: '019a6263-6f97-7230-8449-e979b855ada1',
      title: 'Dushanbe',
      order: 1,
      slug: 'dushanbe',
      parentId: '019a6263-6f97-7230-8449-e979b855ada1',
      default: true,
      createdAt: '2025-11-08T07:34:35.160Z',
      updatedAt: '2025-11-08T07:34:35.160Z',
    },
  })
  region: any;

  @ApiProperty({
    type: ProductVariantDto,
    isArray: true,
  })
  variants: any;

  @ApiProperty({
    example: [
      {
        id: '019a6263-6f97-7230-8449-e979b855ada1',
        attributeId: '019a6263-6f97-7230-8449-e979b855ada1',
        productId: '019a6263-6f97-7230-8449-e979b855ada1',
        attributeValueId: '019a6263-6f97-7230-8449-e979b855ada1',
        productVariantId: '019a6263-6f97-7230-8449-e979b855ada1',
        createdAt: '2025-11-08T07:34:35.160Z',
        updatedAt: '2025-11-08T07:34:35.160Z',
        attribute: {
          id: '019a6263-6f97-7230-8449-e979b855ada1',
          name: 'Цвет',
          slug: 'tsvet',
          type: 'Type',
          groupId: '019a6263-6f97-7230-8449-e979b855ada1',
          filterable: true,
          order: 1,
          createdAt: '2025-11-08T07:34:35.160Z',
          updatedAt: '2025-11-08T07:34:35.160Z',
        },
        attributeValue: {
          id: '019a6263-6f97-7230-8449-e979b855ada1',
          attributeId: '019a6263-6f97-7230-8449-e979b855ada1',
          value: 'Черный',
          createdAt: '2025-11-08T07:34:35.160Z',
          updatedAt: '2025-11-08T07:34:35.160Z',
        },
      },
    ],
  })
  attributes: any;

  @ApiProperty({
    example: [
      {
        id: '019a6263-6f97-7230-8449-e979b855ada1',
        userId: '019a6263-6f97-7230-8449-e979b855ada1',
        productId: '019a6263-6f97-7230-8449-e979b855ada1',
        rating: 5,
        advantages: 'Comment ...',
        flaws: 'Comment ...',
        comment: 'Comment ...',
        createdAt: '2025-11-08T07:34:35.160Z',
        updatedAt: '2025-11-08T07:34:35.160Z',
        user: {
          id: '019a6263-6f97-7230-8449-e979b855ada1',
          phone: '999999999',
          email: 'example@gmail.com',
          name: 'John',
          role: 'USER',
          avatar:
            'https://res.cloudinary.com/dqklcu4jy/image/upload/v1762587277/avatar/mpmezwvtg0drxtllmm7a.png',
          createdAt: '2025-11-08T07:34:35.160Z',
          updatedAt: '2025-11-08T07:34:35.160Z',
        },
      },
    ],
  })
  reviews: any;
}

export class ProductListResponseDto {
  @ApiProperty({
    type: ProductResponseDto,
    isArray: true,
  })
  data!: ProductResponseDto;

  @ApiProperty({
    type: ResponseListMetaDto,
  })
  meta!: ResponseListMetaDto;
}
