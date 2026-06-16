import { Module } from '@nestjs/common';

import { PartnerProductsController } from '@/modules/partner/products/products.controller';
import { PartnerProductsService } from '@/modules/partner/products/products.service';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';

@Module({
  imports: [PartnerAuthModule],
  controllers: [PartnerProductsController],
  providers: [PartnerProductsService],
})
export class PartnerProductsModule {}
