import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ModelsService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createModelDto: CreateModelDto, imageId?: string) {
    const model = await this.prisma.brand.findUnique({
      where: { slug: createModelDto.slug },
    });

    if (model) {
      throw new ConflictException({
        message: `Model with slug '${createModelDto.slug}' already exists`,
        code: 'CONFLICT',
        error: {
          slug: createModelDto.slug,
          existingId: model.id,
        },
      });
    }

    return await this.prisma.model.create({
      data: {
        name: createModelDto.name,
        slug: createModelDto.slug,
        description: createModelDto.description,
        image: createModelDto.image,
        imageId,
        brandId: createModelDto.brandId,
        order: createModelDto.order,
        popular: createModelDto.popular,
      },
    });
  }

  async findAll() {
    return await this.prisma.model.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const model = await this.prisma.model.findUnique({ where: { id } });

    if (!model) {
      throw new NotFoundException({
        message: 'Model not found',
        code: 'MODEL_NOT_FOUND',
        error: id,
      });
    }

    return model;
  }

  async update(id: string, updateModelDto: UpdateModelDto, imageId?: string) {
    const model = await this.prisma.model.findUnique({ where: { id } });

    if (!model) {
      throw new NotFoundException({
        message: 'Model not found',
        code: 'MODEL_NOT_FOUND',
        error: id,
      });
    }

    if (updateModelDto.slug && model.slug !== updateModelDto.slug) {
      const existing = await this.prisma.model.findUnique({
        where: { slug: updateModelDto.slug },
      });

      if (existing) {
        throw new ConflictException({
          message: `Model with slug '${updateModelDto.slug}' already exists`,
          code: 'CONFLICT',
          error: {
            slug: updateModelDto.slug,
            existingId: existing.id,
          },
        });
      }
    }

    // 2️⃣ Удаляем старое изображение, если пришёл новый логотип
    if (imageId && model.imageId && model.imageId !== imageId) {
      try {
        await this.cloudinary.deleteFile(model.imageId);
      } catch (error) {
        console.warn(
          `Ошибка при удалении старого изображения: ${error.message}`,
        );
      }
    }

    return await this.prisma.model.update({
      where: { id },
      data: {
        ...updateModelDto,
        ...(imageId && { imageId }),
      },
    });
  }

  async remove(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!model) {
      throw new NotFoundException({
        message: 'Model not found',
        code: 'MODEL_NOT_FOUND',
        error: id,
      });
    }

    if (model._count.products) {
      throw new ConflictException({
        message: 'Model cannot be deleted, because it has related products',
        code: 'MODEL_HAS_PRODUCTS',
        error: { id, products: model._count.products },
      });
    }

    if (model.imageId) {
      try {
        await this.cloudinary.deleteFile(model.imageId);
      } catch (error) {
        // ⚠️ Ошибка удаления в Cloudinary не должна мешать удалению из БД
        console.warn(
          `Ошибка при удалении изображения Cloudinary: ${error.message}`,
        );
      }
    }

    return await this.prisma.model.delete({ where: { id } });
  }
}
