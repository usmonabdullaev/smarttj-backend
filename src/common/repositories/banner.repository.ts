import { BannerPosition } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class BannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  getList(position?: BannerPosition) {
    return this.prisma.banner.findMany({
      where: position ? { position } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
