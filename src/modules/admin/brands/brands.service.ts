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
  AdminCreateBrandDto,
  AdminGetBrandsDto,
  AdminUpdateBrandDto,
} from './dto';

@Injectable()
export class AdminBrandsService {
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

  async getAll(query: AdminGetBrandsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {
      ...(query.q
        ? {
            name: {
              contains: query.q,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.popular !== undefined ? { popular: query.popular } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              products: true,
              models: true,
            },
          },
        },
      }),
      this.prisma.brand.count({ where }),
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
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        models: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            products: true,
            models: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Бренд не найден');
    }

    return brand;
  }

  async create(dto: AdminCreateBrandDto, file?: Express.Multer.File) {
    let slug = dto.slug
      ? this.slugifyText(dto.slug)
      : this.slugifyText(dto.name);
    if (!slug) {
      slug = `brand-${Date.now()}`;
    }

    // Проверяем уникальность slug
    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    let logo: string | undefined;
    let logoId: string | undefined;

    if (file) {
      const upload = await this.cloudinary.uploadFile({
        file,
        folder: 'brand',
      });
      logo = upload?.secure_url;
      logoId = upload?.public_id;
    }

    return await this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        order: dto.order ?? 1,
        popular: dto.popular ?? false,
        logo,
        logoId,
      },
    });
  }

  async update(
    id: string,
    dto: AdminUpdateBrandDto,
    file?: Express.Multer.File,
  ) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Бренд не найден');
    }

    let slug = brand.slug;
    if (dto.slug && dto.slug !== brand.slug) {
      slug = this.slugifyText(dto.slug);
      const existing = await this.prisma.brand.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Бренд с таким slug уже существует');
      }
    } else if (dto.name && !dto.slug && dto.name !== brand.name) {
      slug = this.slugifyText(dto.name);
      const existing = await this.prisma.brand.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    let logo = brand.logo;
    let logoId = brand.logoId;

    if (file) {
      if (brand.logoId) {
        await this.cloudinary.deleteFile(brand.logoId);
      }

      const upload = await this.cloudinary.uploadFile({
        file,
        folder: 'brand',
      });
      logo = upload?.secure_url ?? null;
      logoId = upload?.public_id ?? null;
    }

    return await this.prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        slug,
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        ...(dto.popular !== undefined ? { popular: dto.popular } : {}),
        logo,
        logoId,
      },
    });
  }

  async delete(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, models: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Бренд не найден');
    }

    if (brand._count.products > 0) {
      throw new ConflictException(
        `Нельзя удалить бренд, к которому привязано товаров: ${brand._count.products}`,
      );
    }

    if (brand.logoId) {
      await this.cloudinary.deleteFile(brand.logoId);
    }

    await this.prisma.brand.delete({ where: { id } });

    return { success: true, message: 'Бренд успешно удален' };
  }
}
