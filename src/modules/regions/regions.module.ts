import { Module } from '@nestjs/common';

import { RegionsController } from '@/modules/regions/regions.controller';
import { RegionsService } from '@/modules/regions/regions.service';

@Module({
  controllers: [RegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
