import { Module } from '@nestjs/common';

import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';
import { PartnerOrdersRepository } from './orders.repository';
import { PartnerOrdersController } from './orders.controller';
import { PartnerOrdersService } from './orders.service';

@Module({
  imports: [PartnerAuthModule],
  controllers: [PartnerOrdersController],
  providers: [PartnerOrdersService, PartnerOrdersRepository],
  exports: [PartnerOrdersService],
})
export class PartnerOrdersModule {}
