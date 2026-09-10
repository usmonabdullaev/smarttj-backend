import { Module } from '@nestjs/common';

import { NotificationTelegramModule } from '@/bullmq/notification-telegram/notification-telegram.module';
import { AdminNotificationController } from '@/modules/admin/notification/notification.controller';
import { AdminNotificationService } from '@/modules/admin/notification/notification.service';
import { NotificationModule } from '@/bullmq/notification/notification.module';
import { AdminNotificationRepository } from './notification.repository';

@Module({
  imports: [NotificationModule, NotificationTelegramModule],
  controllers: [AdminNotificationController],
  providers: [AdminNotificationService, AdminNotificationRepository],
})
export class AdminNotificationModule {}
