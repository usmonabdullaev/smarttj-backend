import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AdminBannersRepository {
  constructor(private readonly prisma: PrismaService) {}

  getById(id: string) {
    return this.prisma.banner.findUnique({ where: { id } });
  }

  create(data: Prisma.BannerCreateInput) {
    return this.prisma.banner.create({ data });
  }

  update(id: string, data: Prisma.BannerUpdateInput) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
