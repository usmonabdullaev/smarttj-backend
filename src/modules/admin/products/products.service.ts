import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { ProductRepository } from '@/common/repositories';

@Injectable()
export class AdminProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productRepository.getAllWithInclude(skip, limit),
      this.productRepository.count(),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getManualModeration(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productRepository.getAllWithInclude(skip, limit, {
        status: ProductStatus.MANUAL_MODERATION,
      }),
      this.productRepository.count({ status: ProductStatus.MANUAL_MODERATION }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const product = await this.productRepository.getByIdWithInclude(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async publish(id: string) {
    const product = await this.productRepository.getById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TODO: add moderations

    return await this.productRepository.update(id, {
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    });
  }
}
