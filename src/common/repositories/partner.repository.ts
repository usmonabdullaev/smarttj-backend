import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class PartnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.partner.findUnique({
      where: { userId },
      include: {
        user: {
          select: userSelect,
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.partner.findUnique({
      where: { id },
      include: {
        user: {
          select: userSelect,
        },
      },
    });
  }

  update(id: string, data: Prisma.PartnerUpdateInput) {
    return this.prisma.partner.update({
      where: { id },
      data,
      include: {
        user: {
          select: userSelect,
        },
      },
    });
  }

  updateByUserId(userId: string, data: Prisma.PartnerUpdateInput) {
    return this.prisma.partner.update({
      where: { userId },
      data,
      include: {
        user: {
          select: userSelect,
        },
      },
    });
  }
}
