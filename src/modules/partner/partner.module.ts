import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PartnerTelegramModule } from '@/modules/partner/telegram/partner-telegram.module';
import { PartnerStatisticsModule } from '@/modules/partner/statistics/statistics.module';
import { PartnerProfileModule } from '@/modules/partner/profile/profile.module';
import { PartnerProductsModule } from '@/modules/partner/products/products.module';
import { PartnerOrdersModule } from '@/modules/partner/orders/orders.module';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';

const PARTNER_MODULES = [
  PartnerAuthModule,
  PartnerProductsModule,
  PartnerOrdersModule,
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
