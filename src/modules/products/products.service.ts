import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Prisma, ReviewStatus } from '@prisma/client';

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
        where: { status: ReviewStatus.PUBLISHED },
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      attribute: {
        include: {
          group: true,
        },
      },
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

  private async resolveCategoryIds(
    categoryIdOrSlug: string,
  ): Promise<string[]> {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: categoryIdOrSlug }, { slug: categoryIdOrSlug }],
      },
    });

    if (!category) {
      return [];
    }

    return await this.getCategoryAndDescendantIds(category.id);
  }

  private async buildAttributeWhereFilters(
    attributeValueIds?: string[],
    attributes?: Record<string, string[] | string>,
  ): Promise<Prisma.ProductVariantWhereInput[]> {
    const filters: Prisma.ProductVariantWhereInput[] = [];
    const attrToValueIds = new Map<string, Set<string>>();

    // 1. Если переданы attributeValueIds, узнаем к какому attributeId они относятся
    if (attributeValueIds && attributeValueIds.length > 0) {
      const foundValues = await this.prisma.attributeValue.findMany({
        where: { id: { in: attributeValueIds } },
        select: { id: true, attributeId: true },
      });

      for (const val of foundValues) {
        if (!attrToValueIds.has(val.attributeId)) {
          attrToValueIds.set(val.attributeId, new Set());
        }
        attrToValueIds.get(val.attributeId)!.add(val.id);
      }

      // Если переданы значения, не найденные в таблице AttributeValue (например кастомные строки),
      // фильтруем их напрямую по ProductAttribute
      const foundIds = new Set(foundValues.map((v) => v.id));
      const remainingIds = attributeValueIds.filter((id) => !foundIds.has(id));
      if (remainingIds.length > 0) {
        filters.push({
          attributes: {
            some: {
              OR: [
                { attributeValueId: { in: remainingIds } },
                { valueString: { in: remainingIds } },
                { label: { in: remainingIds } },
              ],
            },
          },
        });
      }
    }

    // 2. Если передан объект attributes: { [attributeId]: valueId | valueId[] }
    if (attributes && typeof attributes === 'object') {
      for (const [attributeId, rawValues] of Object.entries(attributes)) {
        if (!rawValues) continue;
        const valArray = (
          Array.isArray(rawValues) ? rawValues : [rawValues]
        ).filter(Boolean);

        if (valArray.length === 0) continue;

        if (!attrToValueIds.has(attributeId)) {
          attrToValueIds.set(attributeId, new Set());
        }
        for (const val of valArray) {
          attrToValueIds.get(attributeId)!.add(String(val));
        }
      }
    }

    // 3. Для каждого атрибута: значения внутри атрибута объединяются через OR,
    // а разные атрибуты объединяются через AND
    for (const [attributeId, valuesSet] of attrToValueIds.entries()) {
      const values = Array.from(valuesSet);
      if (values.length === 0) continue;

      filters.push({
        attributes: {
          some: {
            attributeId,
            OR: [
              { attributeValueId: { in: values } },
              { valueString: { in: values } },
              { label: { in: values } },
            ],
          },
        },
      });
    }

    return filters;
  }

  async getAll(query: GetProductsQueryDto) {
    const categoryIds = query.categoryId
      ? await this.resolveCategoryIds(query.categoryId)
      : undefined;

    const attributeFilters = await this.buildAttributeWhereFilters(
      query.attributeValueIds,
      query.attributes,
    );

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
        ...(categoryIds && categoryIds.length > 0
          ? { categoryId: { in: categoryIds } }
          : {}),
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
      ...(attributeFilters.length > 0 ? { AND: attributeFilters } : {}),
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
      data: products.map((v) => this.formatVariantWithGroups(v)),
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
      where: {
        OR: [{ id: categorySlug }, { slug: categorySlug }],
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryIds = await this.getCategoryAndDescendantIds(category.id);

    const attributeFilters = await this.buildAttributeWhereFilters(
      query.attributeValueIds,
      query.attributes,
    );

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
      ...(attributeFilters.length > 0 ? { AND: attributeFilters } : {}),
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
      data: products.map((v) => this.formatVariantWithGroups(v)),
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
                attribute: {
                  include: {
                    group: true,
                  },
                },
                attributeValue: true,
              },
            },
          },
        },
        reviews: {
          where: { status: ReviewStatus.PUBLISHED },
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

    return {
      ...product,
      variants: product.variants.map((v) => this.formatVariantWithGroups(v)),
    };
  }

  private formatVariantWithGroups<T extends { attributes?: any[] }>(
    variant: T,
  ): T & { attributeGroups: any[] } {
    if (!variant || !variant.attributes || !Array.isArray(variant.attributes)) {
      return {
        ...variant,
        attributeGroups: [],
      };
    }

    const groupsMap = new Map<
      string,
      {
        id: string | null;
        name: string;
        order: number;
        attributes: any[];
      }
    >();

    const COMMON_GROUP_KEY = '__common__';

    for (const prodAttr of variant.attributes) {
      const attr = prodAttr.attribute;
      const group = attr?.group;

      const groupKey = group?.id || COMMON_GROUP_KEY;
      const groupId = group?.id || null;
      const groupName = group?.name || 'Общие характеристики';
      const groupOrder =
        group?.order !== undefined && group?.order !== null ? group.order : 0;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          id: groupId,
          name: groupName,
          order: groupOrder,
          attributes: [],
        });
      }

      const computedValue =
        prodAttr.label ||
        prodAttr.attributeValue?.label ||
        prodAttr.attributeValue?.valueString ||
        (prodAttr.attributeValue?.valueNumber !== null &&
        prodAttr.attributeValue?.valueNumber !== undefined
          ? prodAttr.attributeValue.valueNumber
          : null) ||
        (prodAttr.attributeValue?.valueBoolean !== null &&
        prodAttr.attributeValue?.valueBoolean !== undefined
          ? prodAttr.attributeValue.valueBoolean
          : null) ||
        prodAttr.valueString ||
        (prodAttr.valueNumber !== null && prodAttr.valueNumber !== undefined
          ? prodAttr.valueNumber
          : null) ||
        (prodAttr.valueBoolean !== null && prodAttr.valueBoolean !== undefined
          ? prodAttr.valueBoolean
          : null) ||
        null;

      groupsMap.get(groupKey)!.attributes.push({
        ...prodAttr,
        value: computedValue,
      });
    }

    // Сортируем атрибуты внутри каждой группы по order, затем по name
    for (const group of groupsMap.values()) {
      group.attributes.sort((a, b) => {
        const orderA = a.attribute?.order ?? 0;
        const orderB = b.attribute?.order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        const nameA = a.attribute?.name || '';
        const nameB = b.attribute?.name || '';
        return nameA.localeCompare(nameB);
      });
    }

    // Сортируем группы по order, затем по name (группа с order: 0 / 'Общие характеристики' идет первой)
    const attributeGroups = Array.from(groupsMap.values()).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    return {
      ...variant,
      attributeGroups,
    };
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

    return uniqueVariants.map((v) => this.formatVariantWithGroups(v));
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
