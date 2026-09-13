import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CheckFavoriteResponseDto,
  FavoriteIdsResponseDto,
  FavoriteItemDto,
  FavoritesListResponseDto,
  GetFavoritesDto,
  ToggleFavoriteDto,
  ToggleFavoriteResponseDto,
} from './dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Переключить товар в избранном (добавить / удалить одним кликом)
   */
  async toggle(
    userId: string,
    dto: ToggleFavoriteDto,
  ): Promise<ToggleFavoriteResponseDto> {
    // 1. Проверяем существование товара
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, deletedAt: true },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException({
        message: 'Товар не найден или был удален',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    // 2. Если передан конкретный вариант, проверяем его принадлежность товару
    if (dto.productVariantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.productVariantId },
        select: { id: true, productId: true },
      });

      if (!variant || variant.productId !== dto.productId) {
        throw new BadRequestException({
          message: 'Указанный вариант не принадлежит данному товару',
          code: 'VARIANT_MISMATCH',
        });
      }
    }

    // 3. Проверяем, есть ли уже товар в избранном
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });

      return {
        isFavorite: false,
        message: 'Товар удален из избранного',
      };
    }

    await this.prisma.favorite.create({
      data: {
        userId,
        productId: dto.productId,
        productVariantId: dto.productVariantId || null,
      },
    });

    return {
      isFavorite: true,
      message: 'Товар добавлен в избранное',
    };
  }

  /**
   * Явное добавление товара в избранное
   */
  async add(
    userId: string,
    dto: ToggleFavoriteDto,
  ): Promise<ToggleFavoriteResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, deletedAt: true },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException({
        message: 'Товар не найден или был удален',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    if (dto.productVariantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.productVariantId },
        select: { id: true, productId: true },
      });

      if (!variant || variant.productId !== dto.productId) {
        throw new BadRequestException({
          message: 'Указанный вариант не принадлежит данному товару',
          code: 'VARIANT_MISMATCH',
        });
      }
    }

    await this.prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      update: {
        ...(dto.productVariantId !== undefined
          ? { productVariantId: dto.productVariantId }
          : {}),
      },
      create: {
        userId,
        productId: dto.productId,
        productVariantId: dto.productVariantId || null,
      },
    });

    return {
      isFavorite: true,
      message: 'Товар добавлен в избранное',
    };
  }

  /**
   * Удалить товар из избранного по productId или favoriteId
   */
  async remove(
    userId: string,
    productIdOrId: string,
  ): Promise<{ success: boolean; message: string }> {
    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId,
        OR: [{ productId: productIdOrId }, { id: productIdOrId }],
      },
      select: { id: true },
    });

    if (!existing) {
      return {
        success: true,
        message: 'Товара уже нет в избранном',
      };
    }

    await this.prisma.favorite.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      message: 'Товар успешно удален из избранного',
    };
  }

  /**
   * Полная очистка списка избранного пользователя
   */
  async clear(userId: string): Promise<{ success: boolean; message: string }> {
    await this.prisma.favorite.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: 'Список избранного успешно очищен',
    };
  }

  /**
   * Проверить, находится ли товар в избранном
   */
  async check(
    userId: string,
    productId: string,
  ): Promise<CheckFavoriteResponseDto> {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: { id: true },
    });

    return {
      isFavorite: !!existing,
    };
  }

  /**
   * Получить список всех ID товаров в избранном (для мгновенной подсветки сердечек в каталоге)
   */
  async getIds(userId: string): Promise<FavoriteIdsResponseDto> {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        product: { deletedAt: null },
      },
      select: { productId: true },
    });

    return {
      ids: favorites.map((f) => f.productId),
    };
  }

  /**
   * Получить пагинированный список избранных товаров со всеми данными для карточки
   */
  async getList(
    userId: string,
    query: GetFavoritesDto,
  ): Promise<FavoritesListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      product: {
        deletedAt: null,
      },
    };

    const [total, favorites] = await Promise.all([
      this.prisma.favorite.count({ where }),
      this.prisma.favorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, slug: true },
              },
              brand: {
                select: { id: true, name: true, slug: true },
              },
              variants: {
                include: {
                  images: {
                    select: { url: true },
                    orderBy: { order: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
          productVariant: {
            include: {
              images: {
                select: { url: true },
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    const items: FavoriteItemDto[] = favorites.map((fav) => {
      const product = fav.product;

      // Находим минимальную цену среди вариантов
      const prices = product.variants.map((v) => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      // Главное изображение (первое изображение первого варианта)
      const firstImage = product.variants[0]?.images[0]?.url || null;

      const variantsSummary = product.variants.map((v) => ({
        id: v.id,
        price: v.price,
        discount: v.discount,
        stock: v.stock,
        label: v.label || null,
        imageUrl: v.images[0]?.url || null,
      }));

      return {
        id: fav.id,
        productId: fav.productId,
        productVariantId: fav.productVariantId,
        createdAt: fav.createdAt,
        product: {
          id: product.id,
          title: product.title || 'Без названия',
          slug: product.slug || '',
          status: product.status,
          averageRating: Number(product.averageRating),
          reviewsCount: product.reviewsCount,
          minPrice,
          mainImage: firstImage,
          category: product.category,
          brand: product.brand,
          variants: variantsSummary,
        },
        variant: fav.productVariant
          ? {
              id: fav.productVariant.id,
              price: fav.productVariant.price,
              discount: fav.productVariant.discount,
              stock: fav.productVariant.stock,
              label: fav.productVariant.label || null,
              imageUrl: fav.productVariant.images[0]?.url || null,
            }
          : null,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

