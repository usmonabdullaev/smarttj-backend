import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { AdminProductsRepository } from './products.repository';
import { ProductRepository } from '@/common/repositories';
import { GetAllRequest } from './dto';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly repository: AdminProductsRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

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

  async delete(id: string) {
    const product = await this.productRepository.getByIdWithInclude(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatus.DELETED) {
      throw new ConflictException('Product is not deleted from partner');
    }

    for (const variant of product.variants) {
      const imageIds = (variant.images || [])
        .map((img) => img.urlId)
        .filter((urlId): urlId is string => Boolean(urlId));

      if (imageIds.length > 0) {
        await this.cloudinary.deleteFiles(imageIds);
      }
    }

    return await this.repository.delete(id);
  }
}
