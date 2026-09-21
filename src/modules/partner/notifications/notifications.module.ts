import { Module } from '@nestjs/common';

import { NotificationModule } from '@/modules/notifications/notifications.module';
import { PartnerNotificationsController } from './notifications.controller';

@Module({
  imports: [NotificationModule],
  controllers: [PartnerNotificationsController],
})
export class PartnerNotificationsModule {}
