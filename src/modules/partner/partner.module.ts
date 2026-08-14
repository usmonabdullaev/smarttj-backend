import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PartnerProductsModule } from '@/modules/partner/products/products.module';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';

const PARTNER_MODULES = [PartnerAuthModule, PartnerProductsModule];

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
