import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(take: number, skip: number, popular?: boolean, q?: string) {
    return this.prisma.brand.findMany({
      where: {
        popular,
        name: { contains: q, mode: 'insensitive' },
      },
      skip,
      take,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  findBySlug(slug: string) {
    return this.prisma.brand.findUnique({ where: { slug } });
  }
}
