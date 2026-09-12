import { Module } from '@nestjs/common';

import { AdminRegionsController } from './regions.controller';
import { AdminRegionsService } from './regions.service';

@Module({
  controllers: [AdminRegionsController],
  providers: [AdminRegionsService],
  exports: [AdminRegionsService],
})
export class AdminRegionsModule {}
