import { Module } from '@nestjs/common';

import { BrandsController } from '@/modules/brands/brands.controller';
import { BrandsService } from '@/modules/brands/brands.service';
import { BrandRepository } from '@/common/repositories';
import { BrandsRepository } from './brands.repository';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository, BrandRepository],
})
export class BrandsModule {}
