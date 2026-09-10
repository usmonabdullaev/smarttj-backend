import { Global, Module } from '@nestjs/common';

import { NotificationTelegramModule } from '@/bullmq/notification-telegram/notification-telegram.module';
import { TelegramCodeStore } from './telegram-code.store';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Global()
@Module({
  imports: [NotificationTelegramModule],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramCodeStore],
  exports: [TelegramService, TelegramCodeStore],
})
export class TelegramModule {}
