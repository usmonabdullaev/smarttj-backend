import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  GetPartnerReviewsDto,
  PartnerReviewItemDto,
  PartnerReviewsListResponseDto,
  PartnerReviewsSummaryResponseDto,
  ProductRatingOverviewDto,
  RatingDistributionDto,
  ReplyReviewDto,
  ReviewSortBy,
  SortOrder,
} from './dto';

@Injectable()
export class PartnerReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Список отзывов на товары текущего партнера с фильтрацией и пагинацией.
   */
  async getList(
    partnerId: string,
    query: GetPartnerReviewsDto,
  ): Promise<PartnerReviewsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      product: {
        partnerId,
        deletedAt: null,
      },
    };

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.rating) {
      where.rating = query.rating;
    } else if (query.minRating !== undefined || query.maxRating !== undefined) {
      where.rating = {
        gte: query.minRating,
        lte: query.maxRating,
      };
    }

    if (query.hasComment) {
      where.comment = { not: '' };
    }

    if (query.from || query.to) {
      where.createdAt = {
        gte: query.from,
        lte: query.to,
      };
    }

    if (query.q && query.q.trim()) {
      const search = query.q.trim();
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { advantages: { contains: search, mode: 'insensitive' } },
        { flaws: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { product: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const sortField =
      query.sortBy === ReviewSortBy.RATING ? 'rating' : 'createdAt';
    const sortDirection = query.sortOrder === SortOrder.ASC ? 'asc' : 'desc';

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              averageRating: true,
              reviewsCount: true,
            },
          },
          productVariant: {
            select: {
              id: true,
              label: true,
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

    const items: PartnerReviewItemDto[] = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      advantages: r.advantages || '',
      flaws: r.flaws || '',
      comment: r.comment || '',
      isVerified: r.isVerified,
      status: r.status,
      replyComment: r.replyComment,
      repliedAt: r.repliedAt,
      orderId: r.orderId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
      },
      product: {
        id: r.product.id,
        title: r.product.title || 'Без названия',
        slug: r.product.slug,
        averageRating: Number(r.product.averageRating),
        reviewsCount: r.product.reviewsCount,
      },
      variant: r.productVariant
        ? {
            id: r.productVariant.id,
            label: r.productVariant.label,
            imageUrl: r.productVariant.images[0]?.url || null,
          }
        : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  /**
   * Сводка рейтинга и распределения отзывов на товары партнера.
   */
  async getSummary(
    partnerId: string,
  ): Promise<PartnerReviewsSummaryResponseDto> {
    const where: Prisma.ReviewWhereInput = {
      product: {
        partnerId,
        deletedAt: null,
      },
    };

    const [
      aggregate,
      distributionRaw,
      withCommentsCount,
      topRatedRaw,
      lowRatedRaw,
    ] = await Promise.all([
      this.prisma.review.aggregate({
        _count: { id: true },
        _avg: { rating: true },
        where,
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        _count: { id: true },
        where,
      }),
      this.prisma.review.count({
        where: {
          ...where,
          comment: { not: '' },
        },
      }),
      this.prisma.product.findMany({
        where: {
          partnerId,
          deletedAt: null,
          reviewsCount: { gt: 0 },
        },
        orderBy: [{ averageRating: 'desc' }, { reviewsCount: 'desc' }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          averageRating: true,
          reviewsCount: true,
          variants: {
            take: 1,
            select: {
              images: {
                take: 1,
                orderBy: { order: 'asc' },
                select: { url: true },
              },
            },
          },
        },
      }),
      this.prisma.product.findMany({
        where: {
          partnerId,
          deletedAt: null,
          reviewsCount: { gt: 0 },
          averageRating: { lt: 4.0 },
        },
        orderBy: [{ averageRating: 'asc' }, { reviewsCount: 'desc' }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          averageRating: true,
          reviewsCount: true,
          variants: {
            take: 1,
            select: {
              images: {
                take: 1,
                orderBy: { order: 'asc' },
                select: { url: true },
              },
            },
          },
        },
      }),
    ]);

    const totalReviews = aggregate._count.id;
    const averageRating = aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(1))
      : 0;

    const countMap = new Map<number, number>(
      distributionRaw.map((d) => [d.rating, d._count.id]),
    );

    const calcPercentage = (count: number) =>
      totalReviews > 0 ? Number(((count / totalReviews) * 100).toFixed(1)) : 0;

    const ratingDistribution: RatingDistributionDto = {
      1: {
        count: countMap.get(1) ?? 0,
        percentage: calcPercentage(countMap.get(1) ?? 0),
      },
      2: {
        count: countMap.get(2) ?? 0,
        percentage: calcPercentage(countMap.get(2) ?? 0),
      },
      3: {
        count: countMap.get(3) ?? 0,
        percentage: calcPercentage(countMap.get(3) ?? 0),
      },
      4: {
        count: countMap.get(4) ?? 0,
        percentage: calcPercentage(countMap.get(4) ?? 0),
      },
      5: {
        count: countMap.get(5) ?? 0,
        percentage: calcPercentage(countMap.get(5) ?? 0),
      },
    };

    const mapProduct = (
      p: (typeof topRatedRaw)[number],
    ): ProductRatingOverviewDto => ({
      id: p.id,
      title: p.title || 'Без названия',
      slug: p.slug,
      averageRating: Number(p.averageRating),
      reviewsCount: p.reviewsCount,
      imageUrl: p.variants[0]?.images[0]?.url || null,
    });

    return {
      averageRating,
      totalReviews,
      withCommentsCount,
      ratingDistribution,
      topRatedProducts: topRatedRaw.map(mapProduct),
      lowRatedProducts: lowRatedRaw.map(mapProduct),
    };
  }

  /**
   * Детальная информация об отзыве с проверкой принадлежности товара партнёру.
   */
  async getById(partnerId: string, id: string): Promise<PartnerReviewItemDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            partnerId: true,
            averageRating: true,
            reviewsCount: true,
          },
        },
        productVariant: {
          select: {
            id: true,
            label: true,
            images: {
              select: { url: true },
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!review || review.product.partnerId !== partnerId) {
      throw new NotFoundException('Отзыв не найден');
    }

    return {
      id: review.id,
      rating: review.rating,
      advantages: review.advantages || '',
      flaws: review.flaws || '',
      comment: review.comment || '',
      isVerified: review.isVerified,
      status: review.status,
      replyComment: review.replyComment,
      repliedAt: review.repliedAt,
      orderId: review.orderId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        name: review.user.name,
        avatar: review.user.avatar,
      },
      product: {
        id: review.product.id,
        title: review.product.title || 'Без названия',
        slug: review.product.slug,
        averageRating: Number(review.product.averageRating),
        reviewsCount: review.product.reviewsCount,
      },
      variant: review.productVariant
        ? {
            id: review.productVariant.id,
            label: review.productVariant.label,
            imageUrl: review.productVariant.images[0]?.url || null,
          }
        : null,
    };
  }

  /**
   * Ответить на отзыв покупателя
   */
  async replyToReview(
    partnerId: string,
    reviewId: string,
    dto: ReplyReviewDto,
  ): Promise<PartnerReviewItemDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { partnerId: true } },
      },
    });

    if (!review || review.product.partnerId !== partnerId) {
      throw new NotFoundException('Отзыв не найден');
    }

    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        replyComment: dto.replyComment.trim(),
        repliedAt: new Date(),
      },
    });

    return await this.getById(partnerId, reviewId);
  }

  /**
   * Удалить свой ответ на отзыв
   */
  async deleteReply(
    partnerId: string,
    reviewId: string,
  ): Promise<PartnerReviewItemDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { partnerId: true } },
      },
    });

    if (!review || review.product.partnerId !== partnerId) {
      throw new NotFoundException('Отзыв не найден');
    }

    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        replyComment: null,
        repliedAt: null,
      },
    });

    return await this.getById(partnerId, reviewId);
  }
}
