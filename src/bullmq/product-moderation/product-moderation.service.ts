import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { QUEUE_KEYS } from '@smarttj/core';
import { Queue } from 'bullmq';

@Injectable()
export class ProductModerationService {
  constructor(
    @InjectQueue(QUEUE_KEYS.PRODUCT_MODERATION)
    private readonly queue: Queue,
  ) {}

  async addProduct(productId: string) {
    await this.queue.add(
      QUEUE_KEYS.PRODUCT_MODERATION,
      { productId },
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
