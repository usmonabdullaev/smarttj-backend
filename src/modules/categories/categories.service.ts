import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';

import { PrismaService } from 'src/database/prisma/prisma.service';

type CategoryTreeDto = {
  children: CategoryTreeDto[];
} & Category;

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

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
      throw new NotFoundException();
    }

    return category;
  }

  async tree() {
    const getCategoryTree = async (
      parentId: string | null,
    ): Promise<CategoryTreeDto[]> => {
      const categories = await this.prisma.category.findMany({
        where: { parentId },
        orderBy: { order: 'asc' },
      });

      return Promise.all(
        categories.map(async (category) => ({
          ...category,
          children: await getCategoryTree(category.id),
        })),
      );
    };

    return await getCategoryTree(null);
  }
}
