import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class ModelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBrandModels(brandId: string) {
    return this.prisma.model.findMany({
      where: { brandId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  findBySlug(slug: string) {
    return this.prisma.model.findUnique({ where: { slug } });
  }
}
