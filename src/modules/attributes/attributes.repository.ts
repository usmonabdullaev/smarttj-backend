import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AttributesRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.attribute.findMany({
      include: { values: true, group: true },
      orderBy: { order: 'asc' },
    });
  }

  getById(id: string) {
    return this.prisma.attribute.findUnique({
      where: { id },
      include: { values: true, group: true },
    });
  }

  defaults() {
    return this.prisma.attribute.findMany({
      where: {
        categoryId: null,
      },
      include: {
        values: true,
      },
    });
  }
}
