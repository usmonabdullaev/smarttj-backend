import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { NotificationTelegramService } from './notification-telegram.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-telegram',
    }),
  ],
  providers: [NotificationTelegramService],
  exports: [NotificationTelegramService],
})
export class NotificationTelegramModule {}
