import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import {
  AdminCreateModelDto,
  AdminGetModelsDto,
  AdminUpdateModelDto,
} from './dto';

@Injectable()
export class AdminModelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private slugifyText(text: string) {
    return slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  async getAll(query: AdminGetModelsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ModelWhereInput = {
      ...(query.q
        ? {
            name: {
              contains: query.q,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.popular !== undefined ? { popular: query.popular } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      this.prisma.model.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: {
        brand: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException('Модель не найдена');
    }

    return model;
  }

  async create(dto: AdminCreateModelDto, file?: Express.Multer.File) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: dto.brandId },
    });
    if (!brand) {
      throw new NotFoundException('Указанный бренд не найден');
    }

    const existingNameInBrand = await this.prisma.model.findUnique({
      where: {
        name_brandId: {
          name: dto.name,
          brandId: dto.brandId,
        },
      },
    });
    if (existingNameInBrand) {
      throw new ConflictException(
        'Модель с таким названием уже существует для данного бренда',
      );
    }

    let slug = dto.slug
      ? this.slugifyText(dto.slug)
      : this.slugifyText(dto.name);
    if (!slug) {
      slug = `model-${Date.now()}`;
    }

    const existingSlug = await this.prisma.model.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    let image: string | undefined;
    let imageId: string | undefined;

    if (file) {
      const upload = await this.cloudinary.uploadFile({
        file,
        folder: 'model',
      });
      image = upload?.secure_url;
      imageId = upload?.public_id;
    }

    return await this.prisma.model.create({
      data: {
        name: dto.name,
        slug,
        brandId: dto.brandId,
        description: dto.description,
        order: dto.order ?? 1,
        popular: dto.popular ?? false,
        image,
        imageId,
      },
      include: {
        brand: true,
      },
    });
  }

  async update(
    id: string,
    dto: AdminUpdateModelDto,
    file?: Express.Multer.File,
  ) {
    const model = await this.prisma.model.findUnique({ where: { id } });
    if (!model) {
      throw new NotFoundException('Модель не найдена');
    }

    const targetBrandId = dto.brandId ?? model.brandId;
    if (dto.brandId && dto.brandId !== model.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });
      if (!brand) {
        throw new NotFoundException('Указанный бренд не найден');
      }
    }

    const targetName = dto.name ?? model.name;
    if (
      (dto.name && dto.name !== model.name) ||
      (dto.brandId && dto.brandId !== model.brandId)
    ) {
      const existingNameInBrand = await this.prisma.model.findFirst({
        where: {
          name: targetName,
          brandId: targetBrandId,
          id: { not: id },
        },
      });
      if (existingNameInBrand) {
        throw new ConflictException(
          'Модель с таким названием уже существует для данного бренда',
        );
      }
    }

    let slug = model.slug;
    if (dto.slug && dto.slug !== model.slug) {
      slug = this.slugifyText(dto.slug);
      const existing = await this.prisma.model.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Модель с таким slug уже существует');
      }
    } else if (dto.name && !dto.slug && dto.name !== model.name) {
      slug = this.slugifyText(dto.name);
      const existing = await this.prisma.model.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    let image = model.image;
    let imageId = model.imageId;

    if (file) {
      if (model.imageId) {
        await this.cloudinary.deleteFile(model.imageId);
      }

      const upload = await this.cloudinary.uploadFile({
        file,
        folder: 'model',
      });
      image = upload?.secure_url ?? null;
      imageId = upload?.public_id ?? null;
    }

    return await this.prisma.model.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.brandId ? { brandId: dto.brandId } : {}),
        slug,
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        ...(dto.popular !== undefined ? { popular: dto.popular } : {}),
        image,
        imageId,
      },
      include: {
        brand: true,
      },
    });
  }

  async delete(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!model) {
      throw new NotFoundException('Модель не найдена');
    }

    if (model._count.products > 0) {
      throw new ConflictException(
        `Нельзя удалить модель, к которой привязано товаров: ${model._count.products}`,
      );
    }

    if (model.imageId) {
      await this.cloudinary.deleteFile(model.imageId);
    }

    await this.prisma.model.delete({ where: { id } });

    return { success: true, message: 'Модель успешно удалена' };
  }
}
