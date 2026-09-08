import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateRequest, GetListRequest, UpdateRequest } from './dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { AdminBannersRepository } from './banners.repository';
import { BannerRepository } from '@/common/repositories';

@Injectable()
export class AdminBannersService {
  constructor(
    private readonly repository: AdminBannersRepository,
    private readonly cloudinary: CloudinaryService,
    private readonly bannerRepository: BannerRepository,
  ) {}

  async getList(query: GetListRequest) {
    return await this.bannerRepository.getList(query.position);
  }

  async getById(id: string) {
    const banner = await this.repository.getById(id);

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async create(dto: CreateRequest) {
    const upload =
      dto.image &&
      (await this.cloudinary.uploadFile({
        file: dto.image,
        folder: 'banner',
      }));

    return await this.repository.create({
      title: dto.title,
      position: dto.position,
      description: dto.description,
      url: dto.url,
      image: upload?.secure_url,
      imageId: upload?.public_id,
    });
  }

  async update(id: string, dto: UpdateRequest) {
    const banner = await this.repository.getById(id);

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    if (dto.image && banner.imageId) {
      await this.cloudinary.deleteFile(banner.imageId);
    }

    const upload =
      dto.image &&
      (await this.cloudinary.uploadFile({
        file: dto.image,
        folder: 'banner',
      }));

    return this.repository.update(id, {
      title: dto.title,
      position: dto.position,
      description: dto.description,
      url: dto.url,
      image: upload?.secure_url,
      imageId: upload?.public_id,
    });
  }

  async delete(id: string) {
    const banner = await this.repository.getById(id);

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    if (banner.imageId) {
      await this.cloudinary.deleteFile(banner.imageId);
    }

    return await this.repository.delete(id);
  }
}
