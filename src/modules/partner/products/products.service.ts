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
import { SlugifyService } from '@/common/services/slugify/slugify.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateProductDto,
  CreateProductVariantDto,
  UpdateProductDto,
  UpdateProductVariantDto,
  UploadImagesRequest,
} from './dto';

/** Статусы товара, видимые партнёру (DELETED = полное удаление, исключается) */
const VISIBLE_STATUSES = Object.values(ProductStatus).filter(
  (s) => s !== ProductStatus.DELETED,
);

/** Общий include для вариантов */
const VARIANT_INCLUDE = {
  images: true,
  attributes: {
    include: {
      attribute: true,
      attributeValue: true,
    },
  },
} as const;

/** Общий include для продукта */
const PRODUCT_INCLUDE = {
  category: true,
  brand: true,
  model: true,
  region: true,
  variants: {
    include: VARIANT_INCLUDE,
  },
} as const;

@Injectable()
export class PartnerProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly productModeration: ProductModerationService,
    private readonly slugify: SlugifyService,
  ) {}

  async getList(profileId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        partnerId: profileId,
        status: { in: VISIBLE_STATUSES },
      },
      include: PRODUCT_INCLUDE,
    });

    return { data: products };
  }

  async getById(id: string, profileId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        partnerId: profileId,
        status: { in: VISIBLE_STATUSES },
      },
      include: PRODUCT_INCLUDE,
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

  async create(partnerId: string, dto: CreateProductDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
        select: { id: true },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    if (dto.modelId) {
      const model = await this.prisma.model.findUnique({
        where: { id: dto.modelId },
        select: { id: true },
      });

      if (!model) {
        throw new NotFoundException('Model not found');
      }
    }

    if (dto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: dto.regionId },
        select: { id: true },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    const slug = await this.slugify.product({ slug: dto.slug || dto.title });

    return await this.prisma.product.create({
      data: {
        partnerId,
        warranty: dto.warranty,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        modelId: dto.modelId,
        regionId: dto.regionId,
        title: dto.title,
        description: dto.description,
        slug,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async update(id: string, partnerId: string, dto: UpdateProductDto) {
    // Убеждаемся что продукт принадлежит партнёру и не удалён
    const existing = await this.prisma.product.findFirst({
      where: { id, partnerId, status: { in: VISIBLE_STATUSES } },
      select: { id: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: id,
      });
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
        select: { id: true },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    if (dto.modelId) {
      const model = await this.prisma.model.findUnique({
        where: { id: dto.modelId },
        select: { id: true },
      });

      if (!model) {
        throw new NotFoundException('Model not found');
      }
    }

    if (dto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: dto.regionId },
        select: { id: true },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    // Пересчитываем slug только если передан новый title или slug
    const slugSource = dto.slug || dto.title;

    const slug = slugSource
      ? await this.slugify.product({
          slug: slugSource,
          excludeId: id,
        })
      : existing.slug;

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
        slug,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async createVariant(
    productId: string,
    partnerId: string,
    dto: CreateProductVariantDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        partnerId,
        status: { in: VISIBLE_STATUSES },
      },
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: productId,
      });
    }

    return this.prisma.productVariant.create({
      data: {
        productId,
        price: dto.price,
        stock: dto.stock,
        attributes: dto.attributes?.length
          ? {
              createMany: {
                data: dto.attributes.map((attr) => ({
                  attributeId: attr.attributeId,
                  attributeValueId: attr.attributeValueId,
                  valueString: attr.valueString,
                  valueNumber: attr.valueNumber,
                  valueBoolean: attr.valueBoolean,
                  label: attr.label,
                })),
              },
            }
          : undefined,
      },
      include: VARIANT_INCLUDE,
    });
  }

  async updateVariant(
    id: string,
    partnerId: string,
    dto: UpdateProductVariantDto,
  ) {
    // Проверяем что вариант принадлежит продукту этого партнёра
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id,
        product: {
          partnerId,
          status: { in: VISIBLE_STATUSES },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException({
        message: 'Variant not found',
        code: 'VARIANT_NOT_FOUND',
        error: id,
      });
    }

    // Удаляем старые атрибуты только если переданы новые
    if (dto.attributes !== undefined) {
      await this.prisma.productAttribute.deleteMany({
        where: { productVariantId: id },
      });
    }

    return await this.prisma.productVariant.update({
      where: { id },
      data: {
        price: dto.price,
        stock: dto.stock,
        ...(dto.attributes !== undefined && {
          attributes: {
            createMany: {
              data: dto.attributes.map((attr) => ({
                attributeId: attr.attributeId,
                attributeValueId: attr.attributeValueId,
                valueString: attr.valueString,
                valueNumber: attr.valueNumber,
                valueBoolean: attr.valueBoolean,
                label: attr.label,
              })),
            },
          },
        }),
      },
      include: VARIANT_INCLUDE,
    });
  }

  async uploadImages(
    variantId: string,
    partnerId: string,
    images: UploadImagesRequest[],
  ) {
    const productVariant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product: {
          partnerId,
          status: { in: VISIBLE_STATUSES },
        },
      },
    });

    if (!productVariant) {
      throw new NotFoundException({
        message: 'Variant not found',
        code: 'VARIANT_NOT_FOUND',
        error: variantId,
      });
    }

    return await this.prisma.image.createMany({
      data: images.map((image) => ({
        productVariantId: variantId,
        url: image.url,
        urlId: image.urlId,
        order: image.order,
      })),
    });
  }

  async publish(id: string, partnerId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        partnerId,
        status: { in: VISIBLE_STATUSES },
      },
      include: {
        variants: {
          include: {
            _count: { select: { images: true } },
            attributes: true,
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

    if (!product.categoryId) {
      throw new BadRequestException({
        message: 'Category is required to publish',
        code: 'CATEGORY_REQUIRED',
      });
    }

    if (!product.brandId) {
      throw new BadRequestException({
        message: 'Brand is required to publish',
        code: 'BRAND_REQUIRED',
      });
    }

    if (!product.regionId) {
      throw new BadRequestException({
        message: 'Region is required to publish',
        code: 'REGION_REQUIRED',
      });
    }

    if (product.variants.length === 0) {
      throw new BadRequestException({
        message: 'At least one variant is required to publish',
        code: 'VARIANTS_REQUIRED',
      });
    }

    const requiredAttributes = await this.prisma.attribute.findMany({
      where: { categoryId: product.categoryId, required: true },
      select: { id: true },
    });

    for (const variant of product.variants) {
      this.checkVariant(variant, requiredAttributes);
    }

    await this.productModeration.addProduct(id);

    return await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.AUTO_MODERATION },
    });
  }

  async deleteImage(id: string, partnerId: string) {
    const image = await this.prisma.image.findFirst({
      where: {
        id,
        productVariant: {
          product: { partnerId },
        },
      },
    });

    if (!image) {
      throw new NotFoundException({
        message: 'Image not found',
        code: 'IMAGE_NOT_FOUND',
        error: id,
      });
    }

    await this.cloudinary.deleteFile(image.urlId);

    return await this.prisma.image.delete({ where: { id } });
  }

  async deleteVariant(id: string, partnerId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id,
        product: { partnerId },
      },
      include: { images: true },
    });

    if (!variant) {
      throw new NotFoundException({
        message: 'Variant not found',
        code: 'VARIANT_NOT_FOUND',
        error: id,
      });
    }

    if (variant.images.length) {
      await this.cloudinary.deleteFiles(variant.images.map((i) => i.urlId));
    }

    return await this.prisma.productVariant.delete({ where: { id } });
  }

  async inactive(id: string, partnerId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        partnerId,
        status: { in: VISIBLE_STATUSES },
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: id,
      });
    }

    return await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.INACTIVE },
    });
  }

  async delete(id: string, partnerId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        partnerId,
        status: { in: VISIBLE_STATUSES },
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        error: id,
      });
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
      throw new BadRequestException({
        message: 'Images not found for variant',
        code: 'IMAGES_REQUIRED',
        error: variant.id,
      });
    }

    const providedIds = new Set(
      variant.attributes.map((attr) => attr.attributeId),
    );

    const missing = requiredAttributes.filter(
      (attr) => !providedIds.has(attr.id),
    );

    if (missing.length > 0) {
      throw new BadRequestException({
        message: 'Required attributes are missing',
        code: 'ATTRIBUTES_REQUIRED',
        error: { variantId: variant.id, missing: missing.map((a) => a.id) },
      });
    }

    return variant;
  }
}
