import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';

import { ProductRepository } from '@/common/repositories';
import { GetAllRequest } from './dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAll(query: GetAllRequest) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      title: {
        contains: query.q,
        mode: 'insensitive',
      },
      status: query.status,
    };

    const [products, total] = await Promise.all([
      this.productRepository.getAllWithInclude(skip, limit, where),
      this.productRepository.count(where),
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
