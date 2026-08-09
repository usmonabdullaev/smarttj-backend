import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.attribute.findMany({
      include: { values: true, group: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: { values: true, group: true },
    });

    if (!attribute) {
      throw new NotFoundException();
    }

    return attribute;
  }

  async findByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        attributes: {
          include: {
            values: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return category.attributes;
  }
}
