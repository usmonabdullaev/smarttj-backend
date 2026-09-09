import { Global, Module } from '@nestjs/common';

import { TelegramCodeStore } from './telegram-code.store';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Global()
@Module({
  controllers: [TelegramController],
  providers: [TelegramService, TelegramCodeStore],
  exports: [TelegramService, TelegramCodeStore],
})
export class TelegramModule {}
