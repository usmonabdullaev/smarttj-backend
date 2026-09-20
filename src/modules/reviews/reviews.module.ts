import { Module } from '@nestjs/common';

import { ReviewModerationModule } from '@/bullmq/review-moderation/review-moderation.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [ReviewModerationModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
