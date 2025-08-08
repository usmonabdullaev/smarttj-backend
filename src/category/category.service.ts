import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug: dto.slug,
      },
    });

    if (category) {
      throw new ConflictException();
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: {
          id: dto.parentId,
        },
      });

      if (!parent) {
        throw new NotFoundException();
      }
    }

    return await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        parentId: dto.parentId,
      },
    });
  }

  async findAll() {
    return await this.prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async getTree() {
    const getCategoriesWithChildren = async (parentId: null | string) => {
      const categories = await this.prisma.category.findMany({
        where: { parentId },
        orderBy: { order: 'asc' },
        include: {
          children: true,
        },
      });

      for (const category of categories) {
        category.children = await getCategoriesWithChildren(category.id);
      }

      return categories;
    };

    return await getCategoriesWithChildren(null);
  }

  async findOneWithChilds(id: string) {
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

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
