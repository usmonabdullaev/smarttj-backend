import { Module } from '@nestjs/common';

import { BannersController } from './banners.controller';
import { BannerRepository } from '@/common/repositories';
import { BannersService } from './banners.service';

@Module({
  controllers: [BannersController],
  providers: [BannersService, BannerRepository],
})
export class BannersModule {}
