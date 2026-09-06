import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { NotificationService } from '@/bullmq/notification/notification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
