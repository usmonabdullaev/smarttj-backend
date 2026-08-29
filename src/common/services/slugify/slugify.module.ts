import { Module } from '@nestjs/common';

import { ProductRepository, RegionRepository } from '@/common/repositories';
import { SlugifyGenerator } from './slugify.generator';
import { SlugifyService } from './slugify.service';

@Module({
  providers: [
    SlugifyService,
    SlugifyGenerator,
    ProductRepository,
    RegionRepository,
  ],
  exports: [SlugifyService],
})
export class SlugifyModule {}
