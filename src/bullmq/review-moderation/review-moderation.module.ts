import { BullModule } from '@nestjs/bullmq';
import { QUEUE_KEYS } from '@smarttj/core';
import { Module } from '@nestjs/common';

import { ReviewModerationService } from '@/bullmq/review-moderation/review-moderation.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_KEYS.REVIEW_MODERATION,
    }),
  ],
  providers: [ReviewModerationService],
  exports: [ReviewModerationService],
})
export class ReviewModerationModule {}
