import { Injectable } from '@nestjs/common';

import { RequestDto } from './dto/request.dto';
import {
  BlogRepository,
  ProductRepository,
  RegionRepository,
} from '@/common/repositories';

@Injectable()
export class SlugifyGenerator {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly regionRepository: RegionRepository,
    private readonly blogRepository: BlogRepository,
  ) {}

  async product(dto: RequestDto) {
    const { slug, excludeId } = dto;

    let unique = slug;
    let counter = 2;

    while (true) {
      const existing = await this.productRepository.getIdBySlug(unique);

      if (!existing || existing.id === excludeId) {
        return unique;
      }

      unique = `${slug}-${counter}`;
      counter++;
    }
  }

  async region(dto: RequestDto) {
    const { slug, excludeId } = dto;

    let unique = slug;
    let counter = 2;

    while (true) {
      const existing = await this.regionRepository.getIdBySlug(unique);

      if (!existing || existing.id === excludeId) {
        return unique;
      }

      unique = `${slug}-${counter}`;
      counter++;
    }
  }

  async blog(dto: RequestDto) {
    const { slug, excludeId } = dto;

    let unique = slug;
    let counter = 2;

    while (true) {
      const existing = await this.blogRepository.getBySlug(unique);

      if (!existing || existing.id === excludeId) {
        return unique;
      }

      unique = `${slug}-${counter}`;
      counter++;
    }
  }
}
