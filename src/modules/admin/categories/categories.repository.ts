import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AdminCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  uploadIcon(id: string, icon: string, iconId: string) {
    return this.prisma.category.update({
      where: { id },
      data: { icon, iconId },
    });
  }

  deleteIcon(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { icon: null, iconId: null },
    });
  }
}
