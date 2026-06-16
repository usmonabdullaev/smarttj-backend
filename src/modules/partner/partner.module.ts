import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PartnerProductsModule } from '@/modules/partner/products/products.module';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';

@Module({
  imports: [
    PartnerAuthModule,
    PartnerProductsModule,
    RouterModule.register([
      {
        path: 'partner',
        children: [PartnerAuthModule, PartnerProductsModule],
      },
    ]),
  ],
})
export class PartnerModule {}
