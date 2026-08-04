import { Module } from '@nestjs/common';

import { TelegramController } from '@/modules/telegram/telegram.controller';
import { TelegramService } from '@/modules/telegram/telegram.service';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
