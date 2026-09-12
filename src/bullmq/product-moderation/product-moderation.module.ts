import { BullModule } from '@nestjs/bullmq';
import { QUEUE_KEYS } from '@smarttj/core';
import { Module } from '@nestjs/common';

import { ProductModerationService } from '@/bullmq/product-moderation/product-moderation.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_KEYS.PRODUCT_MODERATION,
    }),
  ],
  providers: [ProductModerationService],
  exports: [ProductModerationService],
})
export class ProductModerationModule {}
