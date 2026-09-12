import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateAdminAttributeDto,
  CreateAttributeGroupDto,
  CreateAttributeValueDto,
  GetAdminAttributesDto,
  UpdateAdminAttributeDto,
  UpdateAttributeGroupDto,
  UpdateAttributeValueDto,
} from './dto';

@Injectable()
export class AdminAttributesService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // ГРУППЫ ХАРАКТЕРИСТИК (AttributeGroup)
  // ==========================================

  async getGroups() {
    return await this.prisma.attributeGroup.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { attributes: true },
        },
      },
    });
  }

  async getGroupById(id: string) {
    const group = await this.prisma.attributeGroup.findUnique({
      where: { id },
      include: {
        attributes: {
          orderBy: { order: 'asc' },
          include: {
            values: true,
          },
        },
        _count: {
          select: { attributes: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException({
        message: 'Группа характеристик не найдена',
        code: 'ATTRIBUTE_GROUP_NOT_FOUND',
        error: id,
      });
    }

    return group;
  }

  async createGroup(dto: CreateAttributeGroupDto) {
    const existing = await this.prisma.attributeGroup.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException({
        message: `Группа характеристик "${dto.name}" уже существует`,
        code: 'ATTRIBUTE_GROUP_EXISTS',
        error: dto.name,
      });
    }

    return await this.prisma.attributeGroup.create({
      data: {
        name: dto.name,
        order: dto.order ?? 1,
      },
      include: {
        _count: { select: { attributes: true } },
      },
    });
  }

  async updateGroup(id: string, dto: UpdateAttributeGroupDto) {
    await this.getGroupById(id);

    if (dto.name) {
      const existing = await this.prisma.attributeGroup.findFirst({
        where: { name: dto.name, id: { not: id } },
      });

      if (existing) {
        throw new ConflictException({
          message: `Группа характеристик "${dto.name}" уже существует`,
          code: 'ATTRIBUTE_GROUP_EXISTS',
          error: dto.name,
        });
      }
    }

    return await this.prisma.attributeGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        _count: { select: { attributes: true } },
      },
    });
  }

  async deleteGroup(id: string) {
    const group = await this.getGroupById(id);

    if (group._count.attributes > 0) {
      throw new ConflictException({
        message:
          'Невозможно удалить группу, так как к ней привязаны характеристики. Сначала переместите или удалите их.',
        code: 'GROUP_HAS_ATTRIBUTES',
        error: { id, attributesCount: group._count.attributes },
      });
    }

    await this.prisma.attributeGroup.delete({ where: { id } });

    return {
      success: true,
      message: 'Группа характеристик успешно удалена',
    };
  }

  // ==========================================
  // АТРИБУТЫ / ХАРАКТЕРИСТИКИ (Attribute)
  // ==========================================

  async getAttributes(query: GetAdminAttributesDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AttributeWhereInput = {
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.groupId && { groupId: query.groupId }),
      ...(query.type && { type: query.type }),
      ...(query.q && {
        name: { contains: query.q, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.attribute.findMany({
        where,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          group: true,
          values: {
            take: 10,
          },
          _count: {
            select: {
              values: true,
              ptoductAttributes: true,
            },
          },
        },
      }),
      this.prisma.attribute.count({ where }),
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

  async getAttributeById(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        category: true,
        group: true,
        values: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            values: true,
            ptoductAttributes: true,
          },
        },
      },
    });

    if (!attribute) {
      throw new NotFoundException({
        message: 'Характеристика не найдена',
        code: 'ATTRIBUTE_NOT_FOUND',
        error: id,
      });
    }

    return attribute;
  }

  async createAttribute(dto: CreateAdminAttributeDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException({
          message: 'Категория не найдена',
          code: 'CATEGORY_NOT_FOUND',
          error: dto.categoryId,
        });
      }
    }

    if (dto.groupId) {
      const group = await this.prisma.attributeGroup.findUnique({
        where: { id: dto.groupId },
      });
      if (!group) {
        throw new NotFoundException({
          message: 'Группа характеристик не найдена',
          code: 'ATTRIBUTE_GROUP_NOT_FOUND',
          error: dto.groupId,
        });
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      const attribute = await tx.attribute.create({
        data: {
          name: dto.name,
          type: dto.type,
          unit: dto.unit || null,
          categoryId: dto.categoryId || null,
          groupId: dto.groupId || null,
          required: dto.required ?? false,
          filterable: dto.filterable ?? false,
          order: dto.order ?? 1,
        },
      });

      // Если переданы начальные значения
      if (dto.initialValues && dto.initialValues.length > 0) {
        const valuesData = dto.initialValues.map((val) => ({
          attributeId: attribute.id,
          valueString: val,
          label: val,
        }));

        await tx.attributeValue.createMany({
          data: valuesData,
        });
      }

      return await tx.attribute.findUnique({
        where: { id: attribute.id },
        include: {
          category: true,
          group: true,
          values: true,
        },
      });
    });
  }

  async updateAttribute(id: string, dto: UpdateAdminAttributeDto) {
    await this.getAttributeById(id);

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException({
          message: 'Категория не найдена',
          code: 'CATEGORY_NOT_FOUND',
          error: dto.categoryId,
        });
      }
    }

    if (dto.groupId) {
      const group = await this.prisma.attributeGroup.findUnique({
        where: { id: dto.groupId },
      });
      if (!group) {
        throw new NotFoundException({
          message: 'Группа характеристик не найдена',
          code: 'ATTRIBUTE_GROUP_NOT_FOUND',
          error: dto.groupId,
        });
      }
    }

    return await this.prisma.attribute.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.groupId !== undefined && { groupId: dto.groupId }),
        ...(dto.required !== undefined && { required: dto.required }),
        ...(dto.filterable !== undefined && { filterable: dto.filterable }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        category: true,
        group: true,
        values: true,
      },
    });
  }

  async deleteAttribute(id: string) {
    await this.getAttributeById(id);

    const productUsageCount = await this.prisma.productAttribute.count({
      where: { attributeId: id },
    });

    if (productUsageCount > 0) {
      throw new ConflictException({
        message:
          'Невозможно удалить характеристику, так как она уже привязана к товарам в каталоге',
        code: 'ATTRIBUTE_USED_IN_PRODUCTS',
        error: { id, usageCount: productUsageCount },
      });
    }

    await this.prisma.attribute.delete({ where: { id } });

    return {
      success: true,
      message: 'Характеристика успешно удалена',
    };
  }

  // ==========================================
  // ЗНАЧЕНИЯ ХАРАКТЕРИСТИК (AttributeValue)
  // ==========================================

  async getValues(attributeId: string) {
    await this.getAttributeById(attributeId);

    return await this.prisma.attributeValue.findMany({
      where: { attributeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createValue(attributeId: string, dto: CreateAttributeValueDto) {
    await this.getAttributeById(attributeId);

    const label =
      dto.label ||
      dto.valueString ||
      (dto.valueNumber !== undefined ? `${dto.valueNumber}` : undefined) ||
      (dto.valueBoolean !== undefined ? `${dto.valueBoolean}` : undefined);

    return await this.prisma.attributeValue.create({
      data: {
        attributeId,
        valueString: dto.valueString,
        valueNumber: dto.valueNumber,
        valueBoolean: dto.valueBoolean,
        label,
      },
    });
  }

  async updateValue(
    attributeId: string,
    valueId: string,
    dto: UpdateAttributeValueDto,
  ) {
    const value = await this.prisma.attributeValue.findFirst({
      where: { id: valueId, attributeId },
    });

    if (!value) {
      throw new NotFoundException({
        message: 'Значение характеристики не найдено',
        code: 'ATTRIBUTE_VALUE_NOT_FOUND',
        error: { attributeId, valueId },
      });
    }

    return await this.prisma.attributeValue.update({
      where: { id: valueId },
      data: {
        ...(dto.valueString !== undefined && { valueString: dto.valueString }),
        ...(dto.valueNumber !== undefined && { valueNumber: dto.valueNumber }),
        ...(dto.valueBoolean !== undefined && {
          valueBoolean: dto.valueBoolean,
        }),
        ...(dto.label !== undefined && { label: dto.label }),
      },
    });
  }

  async deleteValue(attributeId: string, valueId: string) {
    const value = await this.prisma.attributeValue.findFirst({
      where: { id: valueId, attributeId },
    });

    if (!value) {
      throw new NotFoundException({
        message: 'Значение характеристики не найдено',
        code: 'ATTRIBUTE_VALUE_NOT_FOUND',
        error: { attributeId, valueId },
      });
    }

    const usageCount = await this.prisma.productAttribute.count({
      where: { attributeValueId: valueId },
    });

    if (usageCount > 0) {
      throw new ConflictException({
        message:
          'Невозможно удалить значение, так как оно уже привязано к товарам в каталоге',
        code: 'VALUE_USED_IN_PRODUCTS',
        error: { valueId, usageCount },
      });
    }

    await this.prisma.attributeValue.delete({ where: { id: valueId } });

    return {
      success: true,
      message: 'Значение характеристики успешно удалено',
    };
  }
}
