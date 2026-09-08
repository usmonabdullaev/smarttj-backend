import { Module } from '@nestjs/common';

import { PartnerStatisticsRepository } from '@/common/repositories';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';
import { PartnerStatisticsController } from './statistics.controller';
import { PartnerStatisticsService } from './statistics.service';

@Module({
  imports: [PartnerAuthModule],
  controllers: [PartnerStatisticsController],
  providers: [PartnerStatisticsService, PartnerStatisticsRepository],
})
export class PartnerStatisticsModule {}
