import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        model: true,
        region: true,
        variants: {
          include: {
            images: true,
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        attributes: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
        reviews: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: id,
      });
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    return await this.prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException({ message: 'Category not found' });
      }

      const brand = await tx.brand.findUnique({ where: { id: dto.brandId } });

      if (!brand) {
        throw new NotFoundException({ message: 'Brand not found' });
      }

      const model = await tx.model.findUnique({ where: { id: dto.modelId } });

      if (!model) {
        throw new NotFoundException({ message: 'Model not found' });
      }

      const region = await tx.region.findUnique({
        where: { id: dto.regionId },
      });

      if (!region) {
        throw new NotFoundException({ message: 'Region not found' });
      }

      const product = await tx.product.create({
        data: {
          title: dto.name, // TODO: name or generate title
          price: dto.variant.price,
          description: dto.description || '', // TODO: FIX
          warranty: 12, // TODO: FIX
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          modelId: dto.modelId,
          regionId: dto.regionId,
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          price: dto.variant.price, // TODO: Add discount
          productId: product.id,
        },
      });

      await tx.productPriceHistory.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          price: dto.variant.price,
        },
      });

      if (dto.variant.images?.length) {
        await tx.image.createMany({
          data: dto.variant.images.map((image, index) => ({
            productVariantId: variant.id,
            url: image.url,
            urlId: image.urlId,
            alt: dto.name,
            order: index + 1,
          })),
        });
      }

      return { product, variant };
    });
  }
}
