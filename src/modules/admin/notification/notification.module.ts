import { Module } from '@nestjs/common';

import { AdminNotificationController } from '@/modules/admin/notification/notification.controller';
import { AdminNotificationService } from '@/modules/admin/notification/notification.service';
import { NotificationModule } from '@/bullmq/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AdminNotificationController],
  providers: [AdminNotificationService],
})
export class AdminNotificationModule {}
