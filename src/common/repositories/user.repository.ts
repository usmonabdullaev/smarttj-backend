import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect, userSelect } from '../selects/user.select';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findFirst({
      where: { googleId },
      select: userSelect,
    });
  }

  findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  findByPhoneRole(phone: string, role: UserRole) {
    return this.prisma.user.findUnique({
      where: { phone_role: { phone, role } },
      select: { id: true },
    });
  }

  upsert(phone: string, role: UserRole, name: string) {
    return this.prisma.user.upsert({
      where: { phone_role: { phone, role } },
      create: {
        name,
        phone,
      },
      update: {},
      select: userSelect,
    });
  }

  findMany(skip: number, take: number, where?: Prisma.UserWhereInput) {
    return this.prisma.user.findMany({
      where,
      select: publicUserSelect,
      skip,
      take,
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  count(where?: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }
}
