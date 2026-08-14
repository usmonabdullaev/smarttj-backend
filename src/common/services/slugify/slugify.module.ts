import { Module } from '@nestjs/common';

import { SlugifyGenerator } from './slugify.generator';
import { SlugifyService } from './slugify.service';

@Module({
  providers: [SlugifyService, SlugifyGenerator],
  exports: [SlugifyService],
})
export class SlugifyModule {}
