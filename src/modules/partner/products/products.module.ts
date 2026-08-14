import { Module } from '@nestjs/common';

import { ProductModerationModule } from '@/bullmq/product-moderation/product-moderation.module';
import { PartnerProductsController } from '@/modules/partner/products/products.controller';
import { PartnerProductsService } from '@/modules/partner/products/products.service';
import { SlugifyModule } from '@/common/services/slugify/slugify.module';
import { PartnerAuthModule } from '@/modules/partner/auth/auth.module';

@Module({
  imports: [PartnerAuthModule, ProductModerationModule, SlugifyModule],
  controllers: [PartnerProductsController],
  providers: [PartnerProductsService],
})
export class PartnerProductsModule {}
