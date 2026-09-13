import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma/prisma.module';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';
import { PartnerReviewsController } from './reviews.controller';
import { PartnerReviewsService } from './reviews.service';

@Module({
  imports: [PrismaModule, PartnerAuthModule],
  controllers: [PartnerReviewsController],
  providers: [PartnerReviewsService],
  exports: [PartnerReviewsService],
})
export class PartnerReviewsModule {}
