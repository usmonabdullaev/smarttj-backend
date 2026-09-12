import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { SendRequest } from './dto/send.dto';
import { QUEUE_KEYS } from '@smarttj/core';

@Injectable()
export class NotificationTelegramService {
  constructor(
    @InjectQueue(QUEUE_KEYS.NOTIFICATION_TELEGRAM)
    private readonly queue: Queue,
  ) {}

  async send(dto: SendRequest) {
    await this.queue.add(QUEUE_KEYS.NOTIFICATION_TELEGRAM, dto, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }
}
