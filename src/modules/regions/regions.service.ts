import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.region.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({ where: { id } });

    if (!region) {
      throw new NotFoundException();
    }

    return region;
  }
}
