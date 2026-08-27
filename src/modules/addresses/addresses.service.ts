import { Injectable, NotFoundException } from '@nestjs/common';

import { AddressesRepository } from './addresses.repository';
import { RegionRepository } from '@/common/repositories';
import { CreateRequest } from './dto';

@Injectable()
export class AddressesService {
  constructor(
    private readonly repository: AddressesRepository,
    private readonly regionRepository: RegionRepository,
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
      region: { connect: { id: dto.regionId } },
      user: { connect: { id: userId } },
    });
  }

  async remove(id: string) {
    const address = await this.repository.findById(id);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return await this.repository.remove(id);
  }
}
