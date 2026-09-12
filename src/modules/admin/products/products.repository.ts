import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AdminProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
