import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from 'src/common/selects/user.select';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(page: number = 1, limit: number = 10) {
    return await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        partner: {
          include: {
            user: {
              select: userSelect,
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
    });
  }

  async getManualModeration(page: number = 1, limit: number = 10) {
    return await this.prisma.product.findMany({
      where: {
        status: ProductStatus.MANUAL_MODERATION,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        partner: {
          include: {
            user: {
              select: userSelect,
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
    });
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            user: {
              select: userSelect,
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
            user: true,
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
