import { Injectable, NotFoundException } from '@nestjs/common';

import { BrandRepository } from '@/common/repositories';
import { ModelsRepository } from './models.repository';

@Injectable()
export class ModelsService {
  constructor(
    private readonly repository: ModelsRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async findBrandModels(brandId: string) {
    const brand = await this.brandRepository.findById(brandId);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return await this.repository.findBrandModels(brandId);
  }

  async findOne(slug: string) {
    const model = await this.repository.findBySlug(slug);

    if (!model) {
      throw new NotFoundException({
        message: 'Model not found',
        code: 'MODEL_NOT_FOUND',
        error: slug,
      });
    }

    return model;
  }
}
