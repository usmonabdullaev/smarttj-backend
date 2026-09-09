import { Module } from '@nestjs/common';

import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';
import { PartnerTelegramController } from './partner-telegram.controller';
import { PartnerTelegramService } from './partner-telegram.service';

@Module({
  imports: [PartnerAuthModule],
  controllers: [PartnerTelegramController],
  providers: [PartnerTelegramService],
  exports: [PartnerTelegramService],
})
export class PartnerTelegramModule {}
