import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma/prisma.module';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';
import { PartnerFinancesController } from './finances.controller';
import { PartnerFinancesService } from './finances.service';

@Module({
  imports: [PrismaModule, PartnerAuthModule],
  controllers: [PartnerFinancesController],
  providers: [PartnerFinancesService],
  exports: [PartnerFinancesService],
})
export class PartnerFinancesModule {}
