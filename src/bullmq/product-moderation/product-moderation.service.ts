import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class ProductModerationService {
  constructor(
    @InjectQueue('product-moderation')
    private readonly queue: Queue,
  ) {}

  async addProduct(productId: string) {
    await this.queue.add(
      'moderate-product',
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
