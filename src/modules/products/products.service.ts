import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Prisma } from '@prisma/client';

import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '@/common/selects/user.select';

const PRODUCT_VARIANT_INCLUDE = {
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
            select: publicUserSelect,
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
} as const;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveOrderBy(
    sort?: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new',
  ):
    | Prisma.ProductVariantOrderByWithRelationInput
    | Prisma.ProductVariantOrderByWithRelationInput[] {
    switch (sort) {
      case 'popular':
        return { product: { soldCount: 'desc' } };
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'rating':
        return { product: { averageRating: 'desc' } };
      case 'new':
        return { product: { publishedAt: 'desc' } };
      default:
        return { createdAt: 'desc' };
    }
  }

  private async getCategoryAndDescendantIds(
    categoryId: string,
  ): Promise<string[]> {
    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    });

    if (children.length === 0) {
      return [categoryId];
    }

    const descendantIds = await Promise.all(
      children.map((c) => this.getCategoryAndDescendantIds(c.id)),
    );

    return [categoryId, ...descendantIds.flat()];
  }

  async getAll(query: GetProductsQueryDto) {
    const productVariantWhere: Prisma.ProductVariantWhereInput = {
      product: {
        title: query.q
          ? {
              contains: query.q,
              mode: 'insensitive',
            }
          : undefined,
        status: {
          in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
        },
        ...(query.brandId ? { brandId: query.brandId } : {}),
        ...(query.rating ? { averageRating: { gte: query.rating } } : {}),
      },
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined && { gte: query.minPrice }),
              ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
            },
          }
        : {}),
    };

    const productVariantOrderBy = this.resolveOrderBy(query.sort);
    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.productVariant.findMany({
        where: productVariantWhere,
        orderBy: productVariantOrderBy,
        take: limit,
        skip,
        include: PRODUCT_VARIANT_INCLUDE,
      }),
      this.prisma.productVariant.count({
        where: productVariantWhere,
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

  async getCategoryProducts(categorySlug: string, query: GetProductsQueryDto) {
    const category = await this.prisma.category.findFirst({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryIds = await this.getCategoryAndDescendantIds(category.id);

    const productVariantWhere: Prisma.ProductVariantWhereInput = {
      product: {
        title: query.q
          ? {
              contains: query.q,
              mode: 'insensitive',
            }
          : undefined,
        status: {
          in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
        },
        categoryId: { in: categoryIds },
        ...(query.brandId ? { brandId: query.brandId } : {}),
        ...(query.rating ? { averageRating: { gte: query.rating } } : {}),
      },
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined && { gte: query.minPrice }),
              ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
            },
          }
        : {}),
    };

    const productVariantOrderBy = this.resolveOrderBy(query.sort);
    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.productVariant.findMany({
        where: productVariantWhere,
        orderBy: productVariantOrderBy,
        take: limit,
        skip,
        include: PRODUCT_VARIANT_INCLUDE,
      }),
      this.prisma.productVariant.count({
        where: productVariantWhere,
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

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
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
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: slug,
      });
    }

    // Инкрементируем счетчик просмотров асинхронно
    void this.prisma.product
      .update({
        where: { id: product.id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    return product;
  }
}
