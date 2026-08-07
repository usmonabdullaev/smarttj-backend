import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GetCategoriesDto } from '@/modules/admin/categories/dto/get-categories.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly logger: LoggerService,
  ) {}

  async getAll(query: GetCategoriesDto) {
    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    return await this.prisma.category.findMany({
      where: {
        parentKey: 'ROOT',
      },
      skip: skip,
      take: limit,
      orderBy: {
        order: 'asc',
      },
      include: {
        children: {
          orderBy: {
            order: 'asc',
          },
          include: {
            children: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async getById(id: string) {
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
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.children > 0) {
      throw new ConflictException('Category has children');
    }

    if (category._count.products > 0) {
      throw new ConflictException('Category has products');
    }

    if (category.iconId) {
      try {
        await this.cloudinary.deleteFile(category.iconId);
      } catch (error) {
        this.logger.error(
          'Ошибка при удалении изображения [delete/category-icon]',
          error,
        );
      }
    }

    return await this.prisma.category.delete({ where: { id } });
  }
}
