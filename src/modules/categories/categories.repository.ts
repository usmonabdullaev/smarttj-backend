import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string) {
    return await this.prisma.category.findUnique({ where: { slug } });
  }
}
