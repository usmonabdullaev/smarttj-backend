import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

type CategoryTreeDto = {
  children: CategoryTreeDto[];
} & Category;

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
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

  async create() {}

  async update() {}

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        error: id,
      });
    }

    if (category._count.children) {
      throw new ConflictException({
        message:
          'Category cannot be deleted, because it has related categories',
        code: 'CATEGORY_HAS_CATEGORIES',
        error: { id, categories: category._count.children },
      });
    }

    if (category.iconId) {
      try {
        await this.cloudinary.deleteFile(category.iconId);
      } catch (error) {
        console.warn(
          `Ошибка при удалении изображения Cloudinary: ${error.message}`,
        );
      }
    }

    return await this.prisma.category.delete({ where: { id } });
  }
}
