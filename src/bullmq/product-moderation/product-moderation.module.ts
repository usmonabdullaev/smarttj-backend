import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ProductModerationService } from '@/bullmq/product-moderation/product-moderation.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'product-moderation',
    }),
  ],
  providers: [ProductModerationService],
  exports: [ProductModerationService],
})
export class ProductModerationModule {}
