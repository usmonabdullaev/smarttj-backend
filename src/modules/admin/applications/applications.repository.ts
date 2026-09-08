import { ApplicationStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AdminApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getList(skip: number, take: number, status?: ApplicationStatus) {
    return this.prisma.application.findMany({
      where: { status },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  getById(id: string) {
    return this.prisma.application.findUnique({ where: { id } });
  }

  updateStatus(id: string, status: ApplicationStatus) {
    return this.prisma.application.update({ where: { id }, data: { status } });
  }

  delete(id: string) {
    return this.prisma.application.delete({ where: { id } });
  }
}
