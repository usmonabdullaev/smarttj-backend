import { Express } from 'express';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import {
  AdminCreateCategoryDto,
  AdminGetCategoriesDto,
  AdminUpdateCategoryDto,
} from './dto';

@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private slugifyText(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  /**
   * Список категорий с пагинацией, поиском и фильтрацией
   */
  async getAll(query: AdminGetCategoriesDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(query.q
        ? {
            OR: [
              {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                short_name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(query.rootOnly ? { parentKey: 'ROOT' } : {}),
      ...(query.parentId ? { parentId: query.parentId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              children: true,
              products: true,
              attributes: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
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

  /**
   * Иерархическое дерево всех категорий со всеми уровнями вложенности
   */
  async getTree() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    const categoryMap = new Map<string, any>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootNodes: any[] = [];

    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  /**
   * Получить категорию по ID с подкатегориями и счетчиками
   */
  async getById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
            attributes: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  /**
   * Создание новой категории
   */
  async create(dto: AdminCreateCategoryDto, iconFile?: Express.Multer.File) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Родительская категория не найдена');
      }
    }

    let slug = dto.slug
      ? this.slugifyText(dto.slug)
      : this.slugifyText(dto.name);
    if (!slug) {
      slug = `category-${Date.now()}`;
    }

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    let icon: string | undefined;
    let iconId: string | undefined;

    if (iconFile) {
      const upload = await this.cloudinary.uploadFile({
        file: iconFile,
        folder: 'category',
      });
      icon = upload?.secure_url;
      iconId = upload?.public_id;
    }

    const parentKey = dto.parentId ? dto.parentId : 'ROOT';
    const short_name = dto.short_name?.trim() || dto.name.trim();

    return await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        short_name,
        slug,
        order: dto.order ?? 1,
        parentId: dto.parentId || null,
        parentKey,
        icon,
        iconId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });
  }

  /**
   * Обновление категории
   */
  async update(
    id: string,
    dto: AdminUpdateCategoryDto,
    iconFile?: Express.Multer.File,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    let parentId = category.parentId;
    let parentKey = category.parentKey;

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException(
          'Категория не может быть родительской для самой себя',
        );
      }

      if (dto.parentId !== null && dto.parentId !== category.parentId) {
        const targetParent = await this.prisma.category.findUnique({
          where: { id: dto.parentId },
        });

        if (!targetParent) {
          throw new NotFoundException(
            'Указанная родительская категория не найдена',
          );
        }

        // Проверка против циклических зависимостей
        let currentParentId: string | null = dto.parentId;
        while (currentParentId) {
          if (currentParentId === id) {
            throw new BadRequestException(
              'Нельзя переместить категорию внутрь её собственного потомка (циклическая зависимость)',
            );
          }
          const ancestor: { parentId: string | null } | null =
            await this.prisma.category.findUnique({
              where: { id: currentParentId },
              select: { parentId: true },
            });
          currentParentId = ancestor?.parentId ?? null;
        }

        parentId = dto.parentId;
        parentKey = dto.parentId;
      } else if (dto.parentId === null) {
        parentId = null;
        parentKey = 'ROOT';
      }
    }

    let slug = category.slug;
    if (dto.slug && dto.slug !== category.slug) {
      slug = this.slugifyText(dto.slug);
      const existing = await this.prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Категория с таким slug уже существует');
      }
    } else if (dto.name && !dto.slug && dto.name !== category.name) {
      slug = this.slugifyText(dto.name);
      const existing = await this.prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    let icon = category.icon;
    let iconId = category.iconId;

    if (iconFile) {
      if (category.iconId) {
        await this.cloudinary.deleteFile(category.iconId);
      }

      const upload = await this.cloudinary.uploadFile({
        file: iconFile,
        folder: 'category',
      });
      icon = upload?.secure_url ?? null;
      iconId = upload?.public_id ?? null;
    }

    return await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.short_name !== undefined
          ? { short_name: dto.short_name.trim() }
          : {}),
        slug,
        parentId,
        parentKey,
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        icon,
        iconId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });
  }

  /**
   * Загрузка иконки категории
   */
  async uploadIcon(id: string, iconFile: Express.Multer.File) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    const upload = await this.cloudinary.uploadFile({
      file: iconFile,
      folder: 'category',
    });

    if (!upload) {
      throw new ServiceUnavailableException(
        'Не удалось загрузить иконку в хранилище',
      );
    }

    if (category.iconId) {
      await this.cloudinary.deleteFile(category.iconId);
    }

    return await this.prisma.category.update({
      where: { id },
      data: {
        icon: upload.secure_url,
        iconId: upload.public_id,
      },
    });
  }

  /**
   * Удаление иконки категории
   */
  async deleteIcon(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    if (category.iconId) {
      await this.cloudinary.deleteFile(category.iconId);
    }

    return await this.prisma.category.update({
      where: { id },
      data: {
        icon: null,
        iconId: null,
      },
    });
  }

  /**
   * Удаление категории с защитой от удаления при наличии подкатегорий или товаров
   */
  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    if (category._count.children > 0) {
      throw new ConflictException(
        `Нельзя удалить категорию, содержащую подкатегории (кол-во: ${category._count.children}). Сначала удалите или переместите подкатегории.`,
      );
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        `Нельзя удалить категорию, к которой привязано товаров: ${category._count.products}. Сначала переместите товары в другую категорию.`,
      );
    }

    if (category.iconId) {
      await this.cloudinary.deleteFile(category.iconId);
    }

    await this.prisma.category.delete({ where: { id } });

    return { success: true, message: 'Категория успешно удалена' };
  }
}
