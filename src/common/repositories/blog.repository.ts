import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.blog.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  getBySlug(slug: string) {
    return this.prisma.blog.findUnique({ where: { slug } });
  }
}
