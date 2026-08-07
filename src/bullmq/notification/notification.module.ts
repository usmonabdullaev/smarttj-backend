import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { NotificationProcessor } from '@/bullmq/notification/notification.processor';
import { NotificationService } from '@/bullmq/notification/notification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
