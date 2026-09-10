import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AdminBlogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getById(id: string) {
    return this.prisma.blog.findUnique({ where: { id } });
  }

  create(data: Prisma.BlogCreateInput) {
    return this.prisma.blog.create({ data });
  }

  update(id: string, data: Prisma.BlogUpdateInput) {
    return this.prisma.blog.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.blog.delete({ where: { id } });
  }
}
