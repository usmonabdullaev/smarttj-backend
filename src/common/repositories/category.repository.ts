import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.CategoryFindManyArgs) {
    return this.prisma.category.findMany(args);
  }

  findById<T extends Prisma.CategoryInclude | undefined = undefined>(
    id: string,
    include?: T,
  ): Promise<Prisma.CategoryGetPayload<{ include: T }> | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include,
    }) as any;
  }

  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  getAttributesWithInclude(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { attributes: { include: { values: true } } },
    });
  }
}
