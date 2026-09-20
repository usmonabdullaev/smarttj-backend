import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUE_KEYS } from '@smarttj/core';
import { Queue } from 'bullmq';

@Injectable()
export class ReviewModerationService {
  constructor(
    @InjectQueue(QUEUE_KEYS.REVIEW_MODERATION)
    private readonly queue: Queue,
  ) {}

  async add(reviewId: string) {
    await this.queue.add(
      QUEUE_KEYS.REVIEW_MODERATION,
      { reviewId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 1000,
        removeOnFail: 500,
      },
    );
  }
}
