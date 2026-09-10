import { Module } from '@nestjs/common';

import { SlugifyGenerator } from './slugify.generator';
import { SlugifyService } from './slugify.service';
import {
  BlogRepository,
  ProductRepository,
  RegionRepository,
} from '@/common/repositories';

@Module({
  providers: [
    SlugifyService,
    SlugifyGenerator,
    ProductRepository,
    RegionRepository,
    BlogRepository,
  ],
  exports: [SlugifyService],
})
export class SlugifyModule {}
