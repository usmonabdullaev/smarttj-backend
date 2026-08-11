import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProductAttribute,
  ProductStatus,
  ProductVariant,
} from '@prisma/client';

import { ProductModerationService } from '@/bullmq/product-moderation/product-moderation.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateProductDto,
  CreateProductVariantDto,
  PublishProductDto,
  UpdateProductDto,
  UpdateProductVariantDto,
  UploadImageDto,
} from '@/modules/partner/products/dto/create-product.dto';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class PartnerProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly logger: LoggerService,
    private readonly productModeration: ProductModerationService,
  ) {}

  async getList(profileId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        partnerId: profileId,
      },
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
      },
    });

    return {
      data: products,
    };
  }

  async getById(id: string, profileId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, partnerId: profileId },
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

  async create(partnerId: string, categoryId: string, dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return await this.prisma.product.create({
      data: {
        partnerId,
        warranty: dto.warranty,
        categoryId,
        brandId: dto.brandId,
        modelId: dto.modelId,
        regionId: dto.regionId,
        title: dto.title,
        description: dto.description,
        slug: dto.slug,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
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
        title: dto.title,
        description: dto.description,
        slug: dto.slug,
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
        stock: dto.stock,
      },
    });
  }

  async updateVariant(id: string, dto: UpdateProductVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException();
    }

    await this.prisma.productAttribute.deleteMany({
      where: { productVariantId: id },
    });

    return await this.prisma.productVariant.update({
      where: { id },
      data: {
        price: dto.price,
        attributes: {
          createMany: {
            data: (dto.attributes || [])?.map((i) => ({
              attributeId: i.attributeId,
              attributeValueId: i.attributeValueId,
              valueString: i.valueString,
              valueNumber: i.valueNumber,
              valueBoolean: i.valueBoolean,
              label: i.label,
            })),
          },
        },
      },
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

  async publish(id: string, dto: PublishProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { title: dto.title, description: dto.description },
      include: {
        variants: {
          include: {
            _count: {
              select: { images: true },
            },
            attributes: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException();
    }

    if (!product.categoryId) {
      throw new BadRequestException();
    }

    if (!product.brandId) {
      throw new BadRequestException();
    }

    if (!product.regionId) {
      throw new BadRequestException();
    }

    const requiredAttributes = await this.prisma.attribute.findMany({
      where: { categoryId: product.categoryId, required: true },
      select: { id: true },
    });

    for (let i = 0; i < product.variants.length; i++) {
      const variant = product.variants[i];
      this.checkVariant(variant, requiredAttributes);
    }

    await this.productModeration.addProduct(id);

    return await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.AUTO_MODERATION },
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
      this.logger.error(
        'Ошибка при удалении изображения [delete/variant-image]',
        {
          error,
        },
      );
    }

    return await this.prisma.image.delete({ where: { id } });
  }

  async deleteVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!variant) {
      throw new NotFoundException();
    }

    if (variant.images.length) {
      try {
        await this.cloudinary.deleteFiles(variant.images.map((i) => i.urlId));
      } catch (error) {
        this.logger.error('Ошибка при удалении изображении [delete/variant]', {
          error,
        });
      }
    }

    return await this.prisma.productVariant.delete({ where: { id } });
  }

  async inactive(id: string) {
    return await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.INACTIVE },
    });
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException();
    }

    return await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
    });
  }

  private checkVariant(
    variant: ProductVariant & {
      _count: { images: number };
      attributes: ProductAttribute[];
    },
    requiredAttributes: { id: string }[],
  ) {
    if (variant._count.images === 0) {
      throw new BadRequestException('Images not found for variant');
    }

    const providedIds = new Set(
      variant.attributes.map((attr) => attr.attributeId),
    );

    const missing = requiredAttributes.filter(
      (attr) => !providedIds.has(attr.id),
    );

    if (missing.length > 0) {
      throw new BadRequestException('Required attributes are missing');
    }

    return variant;
  }
}
