import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '../selects/user.select';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAllWithInclude(
    skip: number,
    take: number,
    where?: Prisma.ProductWhereInput,
  ) {
    return this.prisma.product.findMany({
      where,
      skip,
      take,
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
  }

  getByIdWithInclude(id: string) {
    return this.prisma.product.findUnique({
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
          take: 10,
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
    });
  }

  getById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  count(where?: Prisma.ProductWhereInput) {
    return this.prisma.product.count({ where });
  }
}
