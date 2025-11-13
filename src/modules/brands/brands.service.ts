import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createBrandDto: CreateBrandDto, logoId?: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: createBrandDto.slug },
    });

    if (brand) {
      throw new ConflictException({
        message: `Brand with slug '${createBrandDto.slug}' already exists`,
        code: 'CONFLICT',
        error: {
          slug: createBrandDto.slug,
          existingId: brand.id,
        },
      });
    }

    return await this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        slug: createBrandDto.slug,
        order: createBrandDto.order,
        popular: createBrandDto.popular,
        logo: createBrandDto.logo,
        logoId,
      },
    });
  }

  async findAll() {
    return await this.prisma.brand.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      throw new NotFoundException({
        message: 'Brand not found',
        code: 'BRAND_NOT_FOUND',
        error: id,
      });
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto, logoId?: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      throw new NotFoundException({
        message: 'Brand not found',
        code: 'BRAND_NOT_FOUND',
        error: id,
      });
    }

    if (updateBrandDto.slug && brand.slug !== updateBrandDto.slug) {
      const existing = await this.prisma.brand.findUnique({
        where: { slug: updateBrandDto.slug },
      });

      if (existing) {
        throw new ConflictException({
          message: `Brand with slug '${updateBrandDto.slug}' already exists`,
          code: 'CONFLICT',
          error: {
            slug: updateBrandDto.slug,
            existingId: existing.id,
          },
        });
      }
    }

    // 2️⃣ Удаляем старое изображение, если пришёл новый логотип
    if (logoId && brand.logoId && brand.logoId !== logoId) {
      try {
        await this.cloudinary.deleteFile(brand.logoId);
      } catch (error) {
        console.warn(
          `Ошибка при удалении старого изображения: ${error.message}`,
        );
      }
    }

    return await this.prisma.brand.update({
      where: { id },
      data: {
        ...updateBrandDto,
        ...(logoId && { logoId }),
      },
    });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { models: true, products: true } } },
    });

    if (!brand) {
      throw new NotFoundException({
        message: 'Brand not found',
        code: 'BRAND_NOT_FOUND',
        error: id,
      });
    }

    if (brand._count.products) {
      throw new ConflictException({
        message: 'Brand cannot be deleted, because it has related products',
        code: 'BRAND_HAS_PRODUCTS',
        error: { id, products: brand._count.products },
      });
    }

    if (brand._count.models) {
      throw new ConflictException({
        message: 'Brand cannot be deleted, because it has related models',
        code: 'BRAND_HAS_MODELS',
        error: { id, models: brand._count.models },
      });
    }

    if (brand.logoId) {
      try {
        await this.cloudinary.deleteFile(brand.logoId);
      } catch (error) {
        // ⚠️ Ошибка удаления в Cloudinary не должна мешать удалению из БД
        console.warn(
          `Ошибка при удалении изображения Cloudinary: ${error.message}`,
        );
      }
    }

    return await this.prisma.brand.delete({ where: { id } });
  }
}
