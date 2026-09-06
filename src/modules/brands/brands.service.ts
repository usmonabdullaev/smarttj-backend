import { Injectable, NotFoundException } from '@nestjs/common';

import { BrandRepository } from '@/common/repositories';
import { BrandsRepository } from './brands.repository';
import { FindQuery } from './dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly repository: BrandsRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async findAll(query: FindQuery) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    return await this.repository.findMany(limit, skip, query.popular, query.q);
  }

  async findById(id: string) {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException({
        message: 'Brand not found',
        code: 'BRAND_NOT_FOUND',
        error: id,
      });
    }

    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.repository.findBySlug(slug);

    if (!brand) {
      throw new NotFoundException({
        message: 'Brand not found',
        code: 'BRAND_NOT_FOUND',
        error: slug,
      });
    }

    return brand;
  }
}
