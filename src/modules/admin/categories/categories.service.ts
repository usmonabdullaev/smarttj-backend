import { Express } from 'express';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { AdminCategoriesRepository } from './categories.repository';
import { CategoryRepository } from '@/common/repositories';
import { GetAllRequest } from './dto';

@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly categoryRepository: CategoryRepository,
    private readonly repository: AdminCategoriesRepository,
  ) {}

  async getAll(query: GetAllRequest) {
    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    return await this.categoryRepository.findMany({
      where: {
        parentKey: 'ROOT',
      },
      skip: skip,
      take: limit,
      orderBy: {
        order: 'asc',
      },
      include: {
        children: {
          orderBy: {
            order: 'asc',
          },
          include: {
            children: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async getById(id: string) {
    const category = await this.categoryRepository.findById(id, {
      children: {
        orderBy: {
          order: 'asc',
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async uploadIcon(id: string, icon: Express.Multer.File) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const upload = await this.cloudinary.uploadFile({
      file: icon,
      folder: 'category',
    });

    if (!upload) {
      throw new ServiceUnavailableException('Failed to upload icon');
    }

    if (category.iconId) {
      await this.cloudinary.deleteFile(category.iconId);
    }

    return await this.repository.uploadIcon(
      id,
      upload.secure_url,
      upload.public_id,
    );
  }

  async deleteIcon(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.iconId) {
      await this.cloudinary.deleteFile(category.iconId);
    }

    return await this.repository.deleteIcon(id);
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findById(id, {
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.children > 0) {
      throw new ConflictException('Category has children');
    }

    if (category._count.products > 0) {
      throw new ConflictException('Category has products');
    }

    if (category.iconId) {
      await this.cloudinary.deleteFile(category.iconId);
    }

    return await this.categoryRepository.delete(id);
  }
}
