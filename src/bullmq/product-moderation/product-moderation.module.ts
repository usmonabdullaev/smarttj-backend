import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ProductModerationProcessor } from '@/bullmq/product-moderation/product-moderation.processor';
import { ProductModerationService } from '@/bullmq/product-moderation/product-moderation.service';
import { NotificationModule } from '@/bullmq/notification/notification.module';
import { AIModule } from '@/ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'product-moderation',
    }),
    NotificationModule,
    AIModule,
  ],
  providers: [ProductModerationService, ProductModerationProcessor],
  exports: [ProductModerationService],
})
export class ProductModerationModule {}
