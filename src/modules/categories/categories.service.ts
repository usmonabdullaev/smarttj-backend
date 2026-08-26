import { Injectable, NotFoundException } from '@nestjs/common';

import { CategoryRepository } from '@/common/repositories/category.repository';
import { CategoriesTreeResponseDto } from './dto/category-response.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly repository: CategoriesRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getMain() {
    return await this.categoryRepository.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async getItems(id: string) {
    const category = await this.categoryRepository.findById(id, {
      children: {
        orderBy: {
          order: 'asc',
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
    return await this.getCategoryTree();
  }

  async getById(id: string) {
    const category = await this.categoryRepository.findById(id);

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
    const category = await this.repository.findBySlug(slug);

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        error: slug,
      });
    }

    return category;
  }

  private async getCategoryTree() {
    const getCategory = async (
      parentId: string | null,
      level: number,
    ): Promise<CategoriesTreeResponseDto[]> => {
      const categories = await this.categoryRepository.findMany({
        where: { parentId },
        orderBy: { order: 'asc' },
      });

      return Promise.all(
        categories.map(async (category) => ({
          ...category,
          level,
          children: await getCategory(category.id, level + 1),
        })),
      );
    };

    return await getCategory(null, 1);
  }
}
