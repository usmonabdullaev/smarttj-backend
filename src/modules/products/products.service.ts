import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Prisma } from '@prisma/client';

import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { GetProductBlocksQueryDto } from '@/modules/products/dto/get-product-blocks.dto';
import { ProductBlockDto } from '@/modules/products/dto/product-block-response.dto';
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

  private async getUniqueProductVariants(
    variantWhere: Prisma.ProductVariantWhereInput,
    orderBy:
      | Prisma.ProductVariantOrderByWithRelationInput
      | Prisma.ProductVariantOrderByWithRelationInput[],
    limit: number,
  ) {
    // Берём с запасом, чтобы отфильтровать дубликаты одного и того же товара (разные варианты/цвета)
    const variants = await this.prisma.productVariant.findMany({
      where: variantWhere,
      orderBy,
      take: Math.min(limit * 4, 100),
      include: PRODUCT_VARIANT_INCLUDE,
    });

    const uniqueVariants: typeof variants = [];
    const seenProductIds = new Set<string>();

    for (const variant of variants) {
      if (!seenProductIds.has(variant.productId)) {
        seenProductIds.add(variant.productId);
        uniqueVariants.push(variant);
        if (uniqueVariants.length >= limit) {
          break;
        }
      }
    }

    return uniqueVariants;
  }

  async getBlocks(query: GetProductBlocksQueryDto): Promise<ProductBlockDto[]> {
    const limit = query.limit || 8;
    const categoriesLimit = query.categoriesLimit || 4;

    const baseProductWhere: Prisma.ProductWhereInput = {
      status: {
        in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
      },
    };

    // Параллельно запрашиваем базовые подборки и корневые категории
    const [bestsellers, discounts, newArrivals, topRated, rootCategories] =
      await Promise.all([
        // Хиты продаж
        this.getUniqueProductVariants(
          { product: baseProductWhere },
          [
            { product: { soldCount: 'desc' } },
            { product: { viewsCount: 'desc' } },
          ],
          limit,
        ),
        // Горячие скидки (товары с discount > 0)
        this.getUniqueProductVariants(
          {
            product: baseProductWhere,
            discount: { gt: 0 },
          },
          [{ discount: 'desc' }, { createdAt: 'desc' }],
          limit,
        ),
        // Новинки
        this.getUniqueProductVariants(
          { product: baseProductWhere },
          [
            { product: { publishedAt: 'desc' } },
            { product: { createdAt: 'desc' } },
          ],
          limit,
        ),
        // Высокий рейтинг (от 4.0)
        this.getUniqueProductVariants(
          {
            product: {
              ...baseProductWhere,
              averageRating: { gte: 4 },
            },
          },
          [
            { product: { averageRating: 'desc' } },
            { product: { reviewsCount: 'desc' } },
          ],
          limit,
        ),
        // Корневые категории для блоков
        this.prisma.category.findMany({
          where: { parentId: null },
          orderBy: { order: 'asc' },
          take: categoriesLimit * 2,
        }),
      ]);

    const blocks: ProductBlockDto[] = [];

    // 1. Хиты продаж
    if (bestsellers.length > 0) {
      blocks.push({
        id: 'bestsellers',
        title: 'Хиты продаж',
        subtitle: 'Самые популярные товары',
        type: 'bestsellers',
        category: null,
        items: bestsellers,
      });
    }

    // 2. Горячие скидки
    if (discounts.length > 0) {
      blocks.push({
        id: 'discounts',
        title: 'Горячие скидки',
        subtitle: 'Товары по выгодным ценам',
        type: 'discounts',
        category: null,
        items: discounts,
      });
    }

    // 3. Новинки
    if (newArrivals.length > 0) {
      blocks.push({
        id: 'new-arrivals',
        title: 'Новинки',
        subtitle: 'Свежие поступления в каталог',
        type: 'new',
        category: null,
        items: newArrivals,
      });
    }

    // 4. Высокий рейтинг
    if (topRated.length > 0) {
      blocks.push({
        id: 'top-rated',
        title: 'Высокий рейтинг',
        subtitle: 'Товары с лучшими оценками покупателей',
        type: 'top_rated',
        category: null,
        items: topRated,
      });
    }

    // 5. Категорийные блоки
    for (const cat of rootCategories) {
      if (
        blocks.filter((b) => b.type === 'category').length >= categoriesLimit
      ) {
        break;
      }

      const categoryIds = await this.getCategoryAndDescendantIds(cat.id);
      const catProducts = await this.getUniqueProductVariants(
        {
          product: {
            ...baseProductWhere,
            categoryId: { in: categoryIds },
          },
        },
        [
          { product: { soldCount: 'desc' } },
          { product: { viewsCount: 'desc' } },
        ],
        limit,
      );

      if (catProducts.length > 0) {
        blocks.push({
          id: `category-${cat.slug}`,
          title: cat.name,
          subtitle: `Популярные товары в категории ${cat.name}`,
          type: 'category',
          category: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
          },
          items: catProducts,
        });
      }
    }

    return blocks;
  }

  async getBlockByType(
    type: string,
    requestedLimit?: number,
  ): Promise<ProductBlockDto> {
    const limit = requestedLimit
      ? Math.min(Math.max(Number(requestedLimit), 1), 50)
      : 8;

    const baseProductWhere: Prisma.ProductWhereInput = {
      status: {
        in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
      },
    };

    switch (type) {
      case 'bestsellers':
      case 'popular': {
        const items = await this.getUniqueProductVariants(
          { product: baseProductWhere },
          [
            { product: { soldCount: 'desc' } },
            { product: { viewsCount: 'desc' } },
          ],
          limit,
        );
        return {
          id: 'bestsellers',
          title: 'Хиты продаж',
          subtitle: 'Самые популярные товары',
          type: 'bestsellers',
          category: null,
          items,
        };
      }

      case 'discounts':
      case 'sale': {
        const items = await this.getUniqueProductVariants(
          {
            product: baseProductWhere,
            discount: { gt: 0 },
          },
          [{ discount: 'desc' }, { createdAt: 'desc' }],
          limit,
        );
        return {
          id: 'discounts',
          title: 'Горячие скидки',
          subtitle: 'Товары по выгодным ценам',
          type: 'discounts',
          category: null,
          items,
        };
      }

      case 'new':
      case 'new-arrivals': {
        const items = await this.getUniqueProductVariants(
          { product: baseProductWhere },
          [
            { product: { publishedAt: 'desc' } },
            { product: { createdAt: 'desc' } },
          ],
          limit,
        );
        return {
          id: 'new-arrivals',
          title: 'Новинки',
          subtitle: 'Свежие поступления в каталог',
          type: 'new',
          category: null,
          items,
        };
      }

      case 'top-rated':
      case 'rating': {
        const items = await this.getUniqueProductVariants(
          {
            product: {
              ...baseProductWhere,
              averageRating: { gte: 4 },
            },
          },
          [
            { product: { averageRating: 'desc' } },
            { product: { reviewsCount: 'desc' } },
          ],
          limit,
        );
        return {
          id: 'top-rated',
          title: 'Высокий рейтинг',
          subtitle: 'Товары с лучшими оценками покупателей',
          type: 'top_rated',
          category: null,
          items,
        };
      }

      default: {
        const category = await this.prisma.category.findFirst({
          where: { slug: type },
        });

        if (!category) {
          throw new NotFoundException({
            message: `Product block or category "${type}" not found`,
            code: 'BLOCK_NOT_FOUND',
            error: type,
          });
        }

        const categoryIds = await this.getCategoryAndDescendantIds(category.id);
        const items = await this.getUniqueProductVariants(
          {
            product: {
              ...baseProductWhere,
              categoryId: { in: categoryIds },
            },
          },
          [
            { product: { soldCount: 'desc' } },
            { product: { viewsCount: 'desc' } },
          ],
          limit,
        );

        return {
          id: `category-${category.slug}`,
          title: category.name,
          subtitle: `Популярные товары в категории ${category.name}`,
          type: 'category',
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
          },
          items,
        };
      }
    }
  }
}
