import { Module } from '@nestjs/common';

import { AdminBannersController } from './banners.controller';
import { AdminBannersRepository } from './banners.repository';
import { BannerRepository } from '@/common/repositories';
import { AdminBannersService } from './banners.service';

@Module({
  controllers: [AdminBannersController],
  providers: [AdminBannersService, AdminBannersRepository, BannerRepository],
})
export class AdminBannersModule {}
