import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Prisma } from '@prisma/client';

import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategoryProducts(categorySlug: string, query: GetProductsQueryDto) {
    const category = await this.prisma.category.findFirst({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const productVariantWhere: Prisma.ProductVariantWhereInput = {
      product: {
        title: {
          contains: query.q,
          mode: 'insensitive',
        },
        status: {
          in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
        },
        categoryId: category.id,
        ...(query.rating
          ? {
              averageRating: { gte: query.rating },
            }
          : {}),
      },
    };

    const productVariantOrderBy:
      | Prisma.ProductVariantOrderByWithRelationInput
      | Prisma.ProductVariantOrderByWithRelationInput[] = {
      ...(query.sort === 'popular'
        ? {
            product: {
              soldCount: 'desc',
            },
          }
        : {}),
      ...(query.sort === 'price-asc'
        ? {
            price: 'asc',
          }
        : {}),
      ...(query.sort === 'price-desc'
        ? {
            price: 'desc',
          }
        : {}),
      ...(query.sort === 'rating'
        ? {
            product: {
              averageRating: 'desc',
            },
          }
        : {}),
      ...(query.sort === 'new'
        ? {
            product: {
              publishedAt: 'desc',
            },
          }
        : {}),
    };

    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    const products = await this.prisma.productVariant.findMany({
      where: productVariantWhere,
      orderBy: productVariantOrderBy,
      take: limit,
      skip,
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            model: true,
            region: true,
            reviews: {
              take: 10,
              include: {
                user: {
                  select: {
                    id: true,
                    phone: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
        images: true,
        attributes: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
      },
    });

    const total = await this.prisma.productVariant.count({
      where: productVariantWhere,
    });

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        status: {
          in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
        },
      },
      include: {
        category: true,
        brand: true,
        model: true,
        region: true,
        variants: {
          include: {
            images: true,
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: id,
      });
    }

    return product;
  }
}
