import { ProductStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { SearchQueryDto } from '@/modules/search/dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto) {
    const query = dto.q.trim();

    if (!query) {
      return {
        products: [],
        categories: [],
        brands: [],
        count: 0,
      };
    }

    const LIMIT = 15;

    const products = await this.prisma.product.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
        status: {
          in: [ProductStatus.ACTIVE, ProductStatus.NOT_AVAILABLE],
        },
      },
      include: {
        variants: {
          include: {
            images: true,
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
        },
      },
      take: LIMIT,
    });

    const categories = await this.prisma.category.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: Math.max(0, LIMIT - products.length),
    });

    const brands = await this.prisma.brand.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: Math.max(0, LIMIT - products.length - categories.length),
    });

    return {
      products,
      categories,
      brands,
      count: products.length + categories.length + brands.length,
    };
  }
}
