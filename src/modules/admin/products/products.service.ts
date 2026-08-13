import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '@/common/selects/user.select';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: limit,
        include: {
          partner: {
            include: {
              user: {
                select: publicUserSelect,
              },
            },
          },
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
        },
      }),
      this.prisma.product.count(),
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

  async getManualModeration(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: {
          status: ProductStatus.MANUAL_MODERATION,
        },
        skip,
        take: limit,
        include: {
          partner: {
            include: {
              user: {
                select: publicUserSelect,
              },
            },
          },
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
        },
      }),
      this.prisma.product.count({
        where: { status: ProductStatus.MANUAL_MODERATION },
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
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
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async publish(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TODO: add moderations

    return await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.ACTIVE,
        publishedAt: new Date(),
      },
    });
  }
}
