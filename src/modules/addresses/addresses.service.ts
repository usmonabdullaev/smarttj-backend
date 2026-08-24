import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateRequest } from './dto';
import { AddressesRepository } from './addresses.repository';

@Injectable()
export class AddressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: AddressesRepository,
  ) {}

  async getList(userId: string) {
    return await this.repository.findUserAddresses(userId);
  }

  async getById(id: string) {
    const address = await this.repository.findById(id);

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
      const region = await this.repository.findDefault(userId);

      if (region) {
        await this.repository.updateMany(userId, { default: false });
      }
    }

    const count = await this.repository.count({
      userId,
      default: true,
    });

    if (!count) dto.default = true;

    return await this.repository.create(userId, dto);
  }

  async remove(id: string) {
    const address = await this.repository.findById(id);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return await this.repository.remove(id);
  }
}
