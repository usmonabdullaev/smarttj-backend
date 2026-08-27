import { Injectable, NotFoundException } from '@nestjs/common';

import { AttributesRepository } from './attributes.repository';
import { CategoryRepository } from '@/common/repositories';

@Injectable()
export class AttributesService {
  constructor(
    private readonly repository: AttributesRepository,
    private readonly categoryRepository: CategoryRepository,
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
}
