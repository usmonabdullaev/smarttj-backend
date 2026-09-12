import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';

import { PrismaService } from '@/database/prisma/prisma.service';
import { AdminCreateRegionDto, AdminUpdateRegionDto } from './dto';

@Injectable()
export class AdminRegionsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugifyText(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  async getAll() {
    return await this.prisma.region.findMany({
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
      include: {
        parent: {
          select: { id: true, title: true, slug: true },
        },
        _count: {
          select: {
            children: true,
            users: true,
            products: true,
            adresses: true,
          },
        },
      },
    });
  }

  async getTree() {
    const allRegions = await this.prisma.region.findMany({
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            adresses: true,
          },
        },
      },
    });

    const buildTree = (parentId: string | null = null): any[] => {
      return allRegions
        .filter((r) => r.parentId === parentId)
        .map((r) => ({
          ...r,
          children: buildTree(r.id),
        }));
    };

    return buildTree(null);
  }

  async getById(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            users: true,
            products: true,
            adresses: true,
            children: true,
          },
        },
      },
    });

    if (!region) {
      throw new NotFoundException({
        message: 'Регион не найден',
        code: 'REGION_NOT_FOUND',
        error: id,
      });
    }

    return region;
  }

  async create(dto: AdminCreateRegionDto) {
    const slug = dto.slug
      ? this.slugifyText(dto.slug)
      : this.slugifyText(dto.title);

    const existingSlug = await this.prisma.region.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException({
        message: `Регион со слагом "${slug}" уже существует`,
        code: 'REGION_SLUG_EXISTS',
        error: slug,
      });
    }

    if (dto.parentId) {
      const parent = await this.prisma.region.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException({
          message: 'Родительский регион не найден',
          code: 'PARENT_REGION_NOT_FOUND',
          error: dto.parentId,
        });
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      if (dto.default) {
        await tx.region.updateMany({
          where: { default: true },
          data: { default: false },
        });
      }

      return await tx.region.create({
        data: {
          title: dto.title,
          slug,
          order: dto.order ?? 1,
          parentId: dto.parentId || null,
          default: dto.default ?? false,
        },
        include: {
          parent: true,
        },
      });
    });
  }

  async update(id: string, dto: AdminUpdateRegionDto) {
    const region = await this.getById(id);

    let slug = region.slug;
    if (dto.slug) {
      slug = this.slugifyText(dto.slug);
    } else if (dto.title && dto.title !== region.title) {
      slug = this.slugifyText(dto.title);
    }

    if (slug !== region.slug) {
      const existingSlug = await this.prisma.region.findFirst({
        where: { slug, id: { not: id } },
      });

      if (existingSlug) {
        throw new ConflictException({
          message: `Регион со слагом "${slug}" уже существует`,
          code: 'REGION_SLUG_EXISTS',
          error: slug,
        });
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException({
          message: 'Регион не может быть родителем самого себя',
          code: 'CIRCULAR_DEPENDENCY',
        });
      }

      if (dto.parentId !== null) {
        const parent = await this.prisma.region.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          throw new NotFoundException({
            message: 'Родительский регион не найден',
            code: 'PARENT_REGION_NOT_FOUND',
            error: dto.parentId,
          });
        }

        // Проверка: родитель не должен быть потомком текущего региона
        const descendantIds = await this.getDescendantIds(id);
        if (descendantIds.includes(dto.parentId)) {
          throw new BadRequestException({
            message:
              'Нельзя переместить регион внутрь его собственного потомка',
            code: 'CIRCULAR_DEPENDENCY',
          });
        }
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      if (dto.default) {
        await tx.region.updateMany({
          where: { default: true, id: { not: id } },
          data: { default: false },
        });
      }

      return await tx.region.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          slug,
          ...(dto.order !== undefined && { order: dto.order }),
          ...(dto.parentId !== undefined && { parentId: dto.parentId }),
          ...(dto.default !== undefined && { default: dto.default }),
        },
        include: {
          parent: true,
          children: true,
        },
      });
    });
  }

  async setDefault(id: string) {
    await this.getById(id);

    return await this.prisma.$transaction(async (tx) => {
      await tx.region.updateMany({
        where: { default: true },
        data: { default: false },
      });

      return await tx.region.update({
        where: { id },
        data: { default: true },
        include: { parent: true },
      });
    });
  }

  async delete(id: string) {
    const region = await this.getById(id);

    if (region._count.children > 0) {
      throw new ConflictException({
        message:
          'Невозможно удалить регион, содержащий дочерние районы или города',
        code: 'REGION_HAS_CHILDREN',
        error: { id, childrenCount: region._count.children },
      });
    }

    if (region._count.products > 0 || region._count.adresses > 0) {
      throw new ConflictException({
        message:
          'Невозможно удалить регион, к которому привязаны товары или адреса доставки покупателей',
        code: 'REGION_HAS_RELATIONS',
        error: {
          id,
          productsCount: region._count.products,
          addressesCount: region._count.adresses,
        },
      });
    }

    await this.prisma.region.delete({ where: { id } });

    return {
      success: true,
      message: 'Регион успешно удален',
    };
  }

  private async getDescendantIds(regionId: string): Promise<string[]> {
    const children = await this.prisma.region.findMany({
      where: { parentId: regionId },
      select: { id: true },
    });

    if (children.length === 0) return [];

    const descendants = await Promise.all(
      children.map((c) => this.getDescendantIds(c.id)),
    );

    return [...children.map((c) => c.id), ...descendants.flat()];
  }
}
