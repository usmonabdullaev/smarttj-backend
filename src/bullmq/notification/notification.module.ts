import { BullModule } from '@nestjs/bullmq';
import { QUEUE_KEYS } from '@smarttj/core';
import { Module } from '@nestjs/common';

import { NotificationService } from '@/bullmq/notification/notification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_KEYS.NOTIFICATION,
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
