import { Module } from '@nestjs/common';

import { AdminStatisticsController } from './statistics.controller';
import { AdminStatisticsService } from './statistics.service';

@Module({
  controllers: [AdminStatisticsController],
  providers: [AdminStatisticsService],
  exports: [AdminStatisticsService],
})
export class AdminStatisticsModule {}
