import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';

type CategoryTreeDto = {
  children: CategoryTreeDto[];
  level: number;
} & Category;

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly logger: LoggerService,
  ) {}

  async getMain() {
    return await this.prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async getItems(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        error: id,
      });
    }

    return category;
  }

  async tree() {
    const getCategoryTree = async (
      parentId: string | null,
      level: number,
    ): Promise<CategoryTreeDto[]> => {
      const categories = await this.prisma.category.findMany({
        where: { parentId },
        orderBy: { order: 'asc' },
      });

      return Promise.all(
        categories.map(async (category) => ({
          ...category,
          level,
          children: await getCategoryTree(category.id, level + 1),
        })),
      );
    };

    return await getCategoryTree(null, 1);
  }

  async getById(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        error: id,
      });
    }

    return category;
  }

  async getBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({ where: { slug } });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        error: slug,
      });
    }

    return category;
  }
}
