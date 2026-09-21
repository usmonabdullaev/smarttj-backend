import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';
import { PartnerFinancesModule } from '@/modules/partner/finances/finances.module';
import { PartnerNotificationsModule } from '@/modules/partner/notifications/notifications.module';
import { PartnerOrdersModule } from '@/modules/partner/orders/orders.module';
import { PartnerProductsModule } from '@/modules/partner/products/products.module';
import { PartnerProfileModule } from '@/modules/partner/profile/profile.module';
import { PartnerReviewsModule } from '@/modules/partner/reviews/reviews.module';
import { PartnerStatisticsModule } from '@/modules/partner/statistics/statistics.module';
import { PartnerTelegramModule } from '@/modules/partner/telegram/partner-telegram.module';

const PARTNER_MODULES = [
  PartnerAuthModule,
  PartnerProductsModule,
  PartnerOrdersModule,
  PartnerNotificationsModule,
  PartnerReviewsModule,
  PartnerFinancesModule,
  PartnerStatisticsModule,
  PartnerProfileModule,
  PartnerTelegramModule,
];

@Module({
  imports: [
    ...PARTNER_MODULES,
    RouterModule.register([
      {
        path: 'partner',
        children: PARTNER_MODULES,
      },
    ]),
  ],
})
export class PartnerModule {}
