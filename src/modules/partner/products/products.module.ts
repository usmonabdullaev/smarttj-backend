import { Module } from '@nestjs/common';

import { ProductModerationModule } from 'src/bullmq/product-moderation/product-moderation.module';
import { PartnerProductsController } from '@/modules/partner/products/products.controller';
import { PartnerProductsService } from '@/modules/partner/products/products.service';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';

@Module({
  imports: [PartnerAuthModule, ProductModerationModule],
  controllers: [PartnerProductsController],
  providers: [PartnerProductsService],
})
export class PartnerProductsModule {}
