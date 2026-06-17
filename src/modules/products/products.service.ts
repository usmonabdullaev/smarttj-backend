import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(categoryId: string, query: GetProductsQueryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException();
    }

    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.productVariant.findMany({
        where: {
          product: {
            status: {
              in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
            },
            categoryId,
            ...(query.rating
              ? {
                  averageRating: { gte: query.rating },
                }
              : {}),
          },
        },
        orderBy: {
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
        },
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
      }),
      this.prisma.productVariant.count({
        where: {
          product: {
            status: {
              in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
            },
            categoryId,
            ...(query.rating
              ? {
                  averageRating: { gte: query.rating },
                }
              : {}),
          },
        },
      }),
    ]);

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
