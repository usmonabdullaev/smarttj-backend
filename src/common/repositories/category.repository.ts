import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(args: Prisma.CategoryFindManyArgs) {
    return await this.prisma.category.findMany(args);
  }

  async findById<T extends Prisma.CategoryInclude | undefined = undefined>(
    id: string,
    include?: T,
  ): Promise<Prisma.CategoryGetPayload<{ include: T }> | null> {
    return (await this.prisma.category.findUnique({
      where: { id },
      include,
    })) as any;
  }

  async delete(id: string) {
    return await this.prisma.category.delete({ where: { id } });
  }
}
