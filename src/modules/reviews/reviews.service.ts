import { OrderDeliveryStatus, Prisma, ReviewStatus } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ReviewModerationService } from '@/bullmq/review-moderation/review-moderation.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  ClientReviewSortBy,
  CreateReviewDto,
  GetProductReviewsDto,
  MyReviewsListResponseDto,
  ProductReviewsListResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewModeration: ReviewModerationService,
  ) {}

  /**
   * Оставить отзыв на товар (клиент)
   */
  async create(
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
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

    // 2. Проверяем, оставлял ли пользователь уже отзыв на этот товар
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
    });

    if (existing) {
      throw new ConflictException({
        message:
          'Вы уже оставили отзыв на этот товар. Вы можете отредактировать свой текущий отзыв.',
        code: 'REVIEW_ALREADY_EXISTS',
      });
    }

    // 3. Проверяем факт покупки товара пользователем (isVerified)
    let isVerified = false;
    let verifiedOrderId: string | null = null;

    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: {
          id: dto.orderId,
          userId,
          deliveryStatus: OrderDeliveryStatus.DELIVERED,
          items: {
            some: {
              productVariant: {
                productId: dto.productId,
              },
            },
          },
        },
        select: { id: true },
      });

      if (order) {
        isVerified = true;
        verifiedOrderId = order.id;
      }
    }

    if (!isVerified) {
      const anyDeliveredOrder = await this.prisma.order.findFirst({
        where: {
          userId,
          deliveryStatus: OrderDeliveryStatus.DELIVERED,
          items: {
            some: {
              productVariant: {
                productId: dto.productId,
              },
            },
          },
        },
        select: { id: true },
      });

      if (anyDeliveredOrder) {
        isVerified = true;
        verifiedOrderId = anyDeliveredOrder.id;
      }
    }

    // 4. Создаем отзыв
    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        productVariantId: dto.productVariantId || null,
        orderId: verifiedOrderId,
        rating: dto.rating,
        advantages: dto.advantages?.trim() || '',
        flaws: dto.flaws?.trim() || '',
        comment: dto.comment?.trim() || '',
        isVerified,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
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

    // Send to moderation queue
    await this.reviewModeration.add(review.id);

    return this.mapToReviewResponse(review);
  }

  /**
   * Обновить свой отзыв (клиент)
   */
  async update(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
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

    if (!review || review.userId !== userId) {
      throw new NotFoundException({
        message: 'Отзыв не найден',
        code: 'REVIEW_NOT_FOUND',
      });
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.advantages !== undefined
          ? { advantages: dto.advantages.trim() }
          : {}),
        ...(dto.flaws !== undefined ? { flaws: dto.flaws.trim() } : {}),
        ...(dto.comment !== undefined ? { comment: dto.comment.trim() } : {}),

        status: ReviewStatus.AUTO_MODERATION,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
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

    // Send to moderation queue

    if (dto.rating !== undefined && dto.rating !== review.rating) {
      await this.recalculateProductRating(review.productId);
    }

    return this.mapToReviewResponse(updated);
  }

  /**
   * Удалить свой отзыв (клиент)
   */
  async delete(
    userId: string,
    reviewId: string,
  ): Promise<{ success: boolean; message: string }> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, productId: true },
    });

    if (!review || review.userId !== userId) {
      throw new NotFoundException({
        message: 'Отзыв не найден',
        code: 'REVIEW_NOT_FOUND',
      });
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    await this.recalculateProductRating(review.productId);

    return {
      success: true,
      message: 'Отзыв успешно удален',
    };
  }

  /**
   * Получить список опубликованных отзывов на товар (публичный)
   */
  async getByProduct(
    productId: string,
    query: GetProductReviewsDto,
  ): Promise<ProductReviewsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.ReviewWhereInput = {
      productId,
      status: ReviewStatus.PUBLISHED,
    };

    const where: Prisma.ReviewWhereInput = {
      ...baseWhere,
      ...(query.rating ? { rating: query.rating } : {}),
    };

    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === ClientReviewSortBy.HIGHEST_RATING) {
      orderBy = { rating: 'desc' };
    } else if (query.sortBy === ClientReviewSortBy.LOWEST_RATING) {
      orderBy = { rating: 'asc' };
    }

    const [total, reviews, statsAggregate, statsGroupBy] = await Promise.all([
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
              avatar: true,
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
      this.prisma.review.aggregate({
        where: baseWhere,
        _count: { id: true },
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: baseWhere,
        _count: { id: true },
      }),
    ]);

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const group of statsGroupBy) {
      distribution[group.rating] = group._count.id;
    }

    const averageRating = statsAggregate._avg.rating
      ? Number(statsAggregate._avg.rating.toFixed(1))
      : 0;

    return {
      items: reviews.map((r) => this.mapToReviewResponse(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        averageRating,
        totalReviews: statsAggregate._count.id,
        distribution,
      },
    };
  }

  /**
   * Получить отзывы текущего пользователя (клиент)
   */
  async getMyReviews(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<MyReviewsListResponseDto> {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 10;
    const skip = (validPage - 1) * validLimit;

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where: { userId } }),
      this.prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
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
      items: reviews.map((r) => this.mapToReviewResponse(r)),
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit) || 1,
      },
    };
  }

  /**
   * Пересчет среднего рейтинга и количества отзывов у товара
   */
  async recalculateProductRating(productId: string) {
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

  private mapToReviewResponse(
    review: Prisma.ReviewGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            name: true;
            avatar: true;
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
  ): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      productVariantId: review.productVariantId,
      user: {
        id: review.user.id,
        name: review.user.name || 'Покупатель',
        avatar: review.user.avatar,
      },
      variant: review.productVariant
        ? {
            id: review.productVariant.id,
            label: review.productVariant.label || '',
            imageUrl: review.productVariant.images[0]?.url || null,
          }
        : null,
      rating: review.rating,
      advantages: review.advantages || null,
      flaws: review.flaws || null,
      comment: review.comment || null,
      isVerified: review.isVerified,
      status: review.status,
      replyComment: review.replyComment || null,
      repliedAt: review.repliedAt || null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
