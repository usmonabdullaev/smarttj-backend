import { Module } from '@nestjs/common';

import { BrandsController } from '@/modules/brands/brands.controller';
import { BrandsService } from '@/modules/brands/brands.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
