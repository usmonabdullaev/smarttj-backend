import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.session.findUnique({ where: { id } });
  }

  inactivate(id: string) {
    return this.prisma.session.update({
      where: { id },
      data: { isActive: false },
    });
  }

  upsert(
    where: Prisma.SessionWhereUniqueInput,
    create: Prisma.SessionCreateInput,
    update: Prisma.SessionUpdateInput,
  ) {
    return this.prisma.session.upsert({ where, create, update });
  }
}
