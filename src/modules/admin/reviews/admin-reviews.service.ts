import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReviewStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  AdminReviewItemDto,
  AdminReviewsListResponseDto,
  AdminReviewSortBy,
  AdminSortOrder,
  GetAdminReviewsDto,
  UpdateReviewStatusDto,
} from './dto';

@Injectable()
export class AdminReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Список всех отзывов платформы с фильтрами и пагинацией (Админ)
   */
  async getList(
    query: GetAdminReviewsDto,
  ): Promise<AdminReviewsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.rating) {
      where.rating = query.rating;
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.partnerId) {
      where.product = {
        partnerId: query.partnerId,
      };
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { comment: { contains: q, mode: 'insensitive' } },
        { advantages: { contains: q, mode: 'insensitive' } },
        { flaws: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
        { product: { title: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    let orderBy: Prisma.ReviewOrderByWithRelationInput;
    const direction = query.sortOrder === AdminSortOrder.ASC ? 'asc' : 'desc';

    if (query.sortBy === AdminReviewSortBy.RATING) {
      orderBy = { rating: direction };
    } else {
      orderBy = { createdAt: direction };
    }

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              partner: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          productVariant: {
            include: {
              images: {
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    return {
      items: reviews.map((r) => this.mapToAdminReviewItem(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Получить детальную информацию об отзыве (Админ)
   */
  async getById(id: string): Promise<AdminReviewItemDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            partner: {
              select: {
                id: true,
                storeName: true,
              },
            },
          },
        },
        productVariant: {
          include: {
            images: {
              take: 1,
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException({
        message: 'Отзыв не найден',
        code: 'REVIEW_NOT_FOUND',
      });
    }

    return this.mapToAdminReviewItem(review);
  }

  /**
   * Изменить статус отзыва (Модерация: "AUTO_MODERATION", "MANUAL_MODERATION", "PUBLISHED", "REJECTED", "HIDDEN")
   */
  async updateStatus(
    id: string,
    dto: UpdateReviewStatusDto,
  ): Promise<AdminReviewItemDto> {
    const existing = await this.prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException({
        message: 'Отзыв не найден',
        code: 'REVIEW_NOT_FOUND',
      });
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            partner: {
              select: {
                id: true,
                storeName: true,
              },
            },
          },
        },
        productVariant: {
          include: {
            images: {
              take: 1,
            },
          },
        },
      },
    });

    // При любом изменении статуса пересчитываем рейтинг товара
    await this.recalculateProductRating(existing.productId);

    return this.mapToAdminReviewItem(updated);
  }

  /**
   * Полностью удалить отзыв (Админ)
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.prisma.review.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });

    if (!existing) {
      throw new NotFoundException({
        message: 'Отзыв не найден',
        code: 'REVIEW_NOT_FOUND',
      });
    }

    await this.prisma.review.delete({
      where: { id },
    });

    await this.recalculateProductRating(existing.productId);

    return {
      success: true,
      message: 'Отзыв успешно удален из базы данных',
    };
  }

  /**
   * Пересчет рейтинга товара только по опубликованным отзывам
   */
  async recalculateProductRating(productId: string): Promise<void> {
    const aggregate = await this.prisma.review.aggregate({
      where: {
        productId,
        status: ReviewStatus.PUBLISHED,
      },
      _count: { id: true },
      _avg: { rating: true },
    });

    const reviewsCount = aggregate._count.id;
    const averageRating = aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(1))
      : 0;

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        reviewsCount,
        averageRating,
      },
    });
  }

  private mapToAdminReviewItem(
    review: Prisma.ReviewGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            name: true;
            phone: true;
            email: true;
            avatar: true;
          };
        };
        product: {
          select: {
            id: true;
            title: true;
            slug: true;
            partner: {
              select: {
                id: true;
                storeName: true;
              };
            };
          };
        };
        productVariant: {
          include: {
            images: {
              take: 1;
            };
          };
        };
      };
    }>,
  ): AdminReviewItemDto {
    return {
      id: review.id,
      rating: review.rating,
      advantages: review.advantages || null,
      flaws: review.flaws || null,
      comment: review.comment || null,
      isVerified: review.isVerified,
      status: review.status,
      replyComment: review.replyComment || null,
      repliedAt: review.repliedAt || null,
      orderId: review.orderId || null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        name: review.user.name || 'Без имени',
        phone: review.user.phone,
        email: review.user.email,
        avatar: review.user.avatar,
      },
      product: {
        id: review.product.id,
        title: review.product.title || 'Без названия',
        slug: review.product.slug || '',
        partner: review.product.partner
          ? {
              id: review.product.partner.id,
              storeName: review.product.partner.storeName,
            }
          : null,
      },
      variant: review.productVariant
        ? {
            id: review.productVariant.id,
            label: review.productVariant.label || '',
            imageUrl: review.productVariant.images[0]?.url || null,
          }
        : null,
    };
  }
}
