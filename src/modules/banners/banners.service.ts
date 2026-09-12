import { Injectable } from '@nestjs/common';
import { BannerPosition } from '@prisma/client';

import { BannerRepository } from '@/common/repositories';
import { GetListRequest } from './dto';

@Injectable()
export class BannersService {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async getList(query?: GetListRequest) {
    return this.bannerRepository.getList(
      query?.position || BannerPosition.MAIN,
    );
  }
}
