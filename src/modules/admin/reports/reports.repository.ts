import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AdminReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(skip: number, take: number) {
    return this.prisma.report.findMany({
      skip,
      take,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  getById(id: string) {
    return this.prisma.report.findUnique({ where: { id } });
  }

  count() {
    return this.prisma.report.count();
  }
}
