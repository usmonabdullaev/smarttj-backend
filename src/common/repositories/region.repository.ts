import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class RegionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return await this.prisma.region.findUnique({ where: { id } });
  }
}
