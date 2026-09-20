import { Injectable, NotFoundException } from '@nestjs/common';

import { AttributesRepository } from './attributes.repository';
import { CategoryRepository } from '@/common/repositories';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(
    private readonly repository: AttributesRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return await this.repository.getAll();
  }

  async findOne(id: string) {
    const attribute = await this.repository.getById(id);

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    return attribute;
  }

  async findByCategory(categoryId: string) {
    const category =
      await this.categoryRepository.getAttributesWithInclude(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.attributes;
  }

  async findForProduct(categoryId: string) {
    const categoryAttributes = await this.findByCategory(categoryId);

    const defaultAttributes = await this.repository.defaults();

    return [...categoryAttributes, ...defaultAttributes];
  }

  async getFilterableAttributes(categoryId?: string) {
    if (!categoryId) {
      return await this.repository.getFilterableAttributes();
    }

    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: categoryId }, { slug: categoryId }],
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        error: categoryId,
      });
    }

    // Собираем родителей (предков)
    const ancestorIds: string[] = [];
    let currentParentId = category.parentId;
    while (currentParentId) {
      ancestorIds.push(currentParentId);
      const parentCat = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      currentParentId = parentCat?.parentId || null;
    }

    // Собираем детей (потомков)
    const descendantIds = await this.getDescendantCategoryIds(category.id);

    const allCategoryIds = [category.id, ...ancestorIds, ...descendantIds];

    return await this.repository.getFilterableAttributes(allCategoryIds);
  }

  private async getDescendantCategoryIds(catId: string): Promise<string[]> {
    const children = await this.prisma.category.findMany({
      where: { parentId: catId },
      select: { id: true },
    });

    if (children.length === 0) {
      return [];
    }

    const descendantIds = await Promise.all(
      children.map((c) => this.getDescendantCategoryIds(c.id)),
    );

    return [...children.map((c) => c.id), ...descendantIds.flat()];
  }
}
