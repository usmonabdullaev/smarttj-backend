import { BullModule } from '@nestjs/bullmq';
import { QUEUE_KEYS } from '@smarttj/core';
import { Module } from '@nestjs/common';

import { NotificationTelegramService } from './notification-telegram.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_KEYS.NOTIFICATION_TELEGRAM,
    }),
  ],
  providers: [NotificationTelegramService],
  exports: [NotificationTelegramService],
})
export class NotificationTelegramModule {}
