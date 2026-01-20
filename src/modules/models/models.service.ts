import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { LoggerService } from 'src/logger/logger.service';

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
