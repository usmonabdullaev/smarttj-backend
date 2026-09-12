import { Injectable, NotFoundException } from '@nestjs/common';

import { AddressesRepository } from './addresses.repository';
import { RegionRepository } from '@/common/repositories';
import { CreateRequest, UpdateRequest } from './dto';

@Injectable()
export class AddressesService {
  constructor(
    private readonly repository: AddressesRepository,
    private readonly regionRepository: RegionRepository,
  ) {}

  async getList(userId: string) {
    return await this.repository.findUserAddresses(userId);
  }

  async getById(id: string, userId: string) {
    const address = await this.repository.findById(id);

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async create(userId: string, dto: CreateRequest) {
    if (dto.regionId) {
      const region = await this.regionRepository.findById(dto.regionId);

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

    return await this.repository.create({
      fullname: dto.fullname,
      label: dto.label,
      address: dto.address,
      default: dto.default,
      phone: dto.phone,
      longitude: dto.longitude,
      latitude: dto.latitude,
      ...(dto.regionId ? { region: { connect: { id: dto.regionId } } } : {}),
      user: { connect: { id: userId } },
    });
  }

  async update(id: string, userId: string, dto: UpdateRequest) {
    const address = await this.repository.findById(id);

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    if (dto.regionId) {
      const region = await this.regionRepository.findById(dto.regionId);
      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    if (dto.default) {
      await this.repository.updateMany(userId, { default: false });
    }

    return await this.repository.update(id, {
      fullname: dto.fullname,
      label: dto.label,
      address: dto.address,
      default: dto.default,
      phone: dto.phone,
      longitude: dto.longitude,
      latitude: dto.latitude,
      ...(dto.regionId ? { region: { connect: { id: dto.regionId } } } : {}),
    });
  }

  async remove(id: string, userId: string) {
    const address = await this.repository.findById(id);

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return await this.repository.remove(id);
  }
}
