import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateRequest } from './dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(userId: string) {
    const addresses = await this.prisma.address.findMany({
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

    return addresses;
  }

  async getById(id: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async create(userId: string, dto: CreateRequest) {
    if (dto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: dto.regionId },
        select: { id: true },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    if (dto.default) {
      const region = await this.prisma.address.findFirst({
        where: { userId, default: true },
        select: { id: true },
      });

      if (region) {
        await this.prisma.address.updateMany({
          where: { userId },
          data: { default: false },
        });
      }
    }

    const count = await this.prisma.address.count({
      where: { userId, default: true },
    });

    if (!count) dto.default = true;

    return await this.prisma.address.create({
      data: {
        userId,
        fullname: dto.fullname,
        label: dto.label,
        address: dto.address,
        default: dto.default,
        phone: dto.phone,
        regionId: dto.regionId,
        longitude: dto.longitude,
        latitude: dto.latitude,
      },
    });
  }

  async remove(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return await this.prisma.address.delete({ where: { id } });
  }
}
