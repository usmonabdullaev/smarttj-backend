import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateProductDto,
  CreateProductVariantDto,
} from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        model: true,
        region: true,
        variants: {
          include: {
            images: true,
            priceHistory: true,
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
          include: {
            user: true,
          },
        },
        priceHistory: true,
      },
    });
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        warranty: dto.warranty,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        modelId: dto.modelId,
        regionId: dto.regionId,
        attributes: {
          createMany: {
            data: dto.attributes,
          },
        },
      },
    });

    return product;
  }

  async createVariant(dto: CreateProductVariantDto) {
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: dto.productId,
        price: dto.price,
        discount: dto.discount,
        images: {
          createMany: {
            data: dto.images,
          },
        },
        attributes: {
          createMany: {
            data: dto.attributes.map((a) => ({
              ...a,
              productId: dto.productId,
            })),
          },
        },
      },
    });

    return variant;
  }
}
