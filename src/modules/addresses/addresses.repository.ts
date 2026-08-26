import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserAddresses(userId: string) {
    return await this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        {
          default: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findById(id: string) {
    return await this.prisma.address.findUnique({
      where: { id },
    });
  }

  async findDefault(userId: string) {
    return await this.prisma.address.findFirst({
      where: { userId, default: true },
    });
  }

  async count(where: Prisma.AddressWhereInput) {
    return await this.prisma.address.count({ where });
  }

  async create(data: Prisma.AddressCreateInput) {
    return await this.prisma.address.create({ data });
  }

  async updateMany(
    userId: string,
    data: Prisma.AddressUpdateManyMutationInput,
  ) {
    return await this.prisma.address.updateMany({ where: { userId }, data });
  }

  async remove(id: string) {
    return await this.prisma.address.delete({ where: { id } });
  }
}
