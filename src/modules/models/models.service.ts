import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateModelDto } from '@/modules/models/dto/create-model.dto';
import { UpdateModelDto } from '@/modules/models/dto/update-model.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class ModelsService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly logger: LoggerService,
  ) {}

  async create(createModelDto: CreateModelDto, imageId?: string) {
    const model = await this.prisma.brand.findUnique({
      where: { slug: createModelDto.slug },
    });

    if (model) {
      throw new ConflictException({
        message: 'Slug conflict',
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
        brandId: createModelDto.brandId,
        order: createModelDto.order,
        popular: createModelDto.popular,
        imageId,
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

  async findBrandModels(brandId: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      include: { models: true },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand.models;
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
          message: 'Slug conflict',
          code: 'CONFLICT',
          error: {
            slug: updateModelDto.slug,
            existingId: existing.id,
          },
        });
      }
    }

    if (imageId && model.imageId && model.imageId !== imageId) {
      try {
        await this.cloudinary.deleteFile(model.imageId);
      } catch (error) {
        this.logger.error('Ошибка при удалении изображения [update/models]', {
          error,
        });
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
        this.logger.error('Ошибка при удалении изображения [delete/models]', {
          error,
        });
      }
    }

    return await this.prisma.model.delete({ where: { id } });
  }
}
