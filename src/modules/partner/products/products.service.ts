import { Injectable, NotFoundException } from '@nestjs/common';

import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateProductDto,
  CreateProductVariantDto,
  UploadImageDto,
} from '@/modules/partner/products/dto/create-product.dto';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class PartnerProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly logger: LoggerService,
  ) {}

  // FIX
  async getList(categoryId: string, query: GetProductsQueryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException();
    }

    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.productVariant.findMany({
        where: {
          product: {
            categoryId,
            ...(query.rating
              ? {
                  averageRating: { gte: query.rating },
                }
              : {}),
          },
        },
        orderBy: {
          ...(query.sort === 'popular'
            ? {
                product: {
                  soldCount: 'desc',
                },
              }
            : {}),
          ...(query.sort === 'price-asc'
            ? {
                price: 'asc',
              }
            : {}),
          ...(query.sort === 'price-desc'
            ? {
                price: 'desc',
              }
            : {}),
          ...(query.sort === 'rating'
            ? {
                product: {
                  averageRating: 'desc',
                },
              }
            : {}),
          ...(query.sort === 'new'
            ? {
                product: {
                  publishedAt: 'desc',
                },
              }
            : {}),
        },
        take: limit,
        skip,
        include: {
          product: {
            include: {
              category: true,
              brand: true,
              model: true,
              region: true,
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
          },
          images: true,
          attributes: {
            include: {
              attribute: true,
              attributeValue: true,
            },
          },
        },
      }),
      this.prisma.productVariant.count({ where: { product: { categoryId } } }),
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

  // FIX
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

  async create(partnerId: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return await this.prisma.product.create({
      data: { partnerId, categoryId },
    });
  }

  async update(id: string, dto: CreateProductDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException();
      }
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new NotFoundException();
      }
    }

    if (dto.modelId) {
      const model = await this.prisma.model.findUnique({
        where: { id: dto.modelId },
      });

      if (!model) {
        throw new NotFoundException();
      }
    }

    if (dto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: dto.regionId },
      });

      if (!region) {
        throw new NotFoundException();
      }
    }

    return await this.prisma.product.update({
      where: { id },
      data: {
        warranty: dto.warranty,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        modelId: dto.modelId,
        regionId: dto.regionId,
      },
    });
  }

  async createVariant(productId: string, dto: CreateProductVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException();
    }

    return this.prisma.productVariant.create({
      data: {
        productId,
        price: dto.price,
      },
    });
  }

  async updateVariant(id: string, dto: CreateProductVariantDto) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { price: dto.price },
    });
  }

  async uploadImages(id: string, images: UploadImageDto[]) {
    const productVariant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!productVariant) {
      throw new NotFoundException();
    }

    return await this.prisma.image.createMany({
      data: images.map((image) => ({
        productVariantId: id,
        url: image.url,
        urlId: image.urlId,
        order: image.order,
      })),
    });
  }

  async deleteImage(id: string) {
    const image = await this.prisma.image.findUnique({ where: { id } });

    if (!image) {
      throw new NotFoundException();
    }

    try {
      await this.cloudinary.deleteFile(image.urlId);
    } catch (error) {
      this.logger.error('Ошибка при удалении изображения [delete/image]', {
        error,
      });
    }

    return await this.prisma.image.delete({ where: { id } });
  }
}
