import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { TelegramService } from '@/modules/telegram/telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user sessions' })
  async getProfile(@Headers('X-Telegram-Id') telegramId: string) {
    if (!telegramId) {
      throw new BadRequestException('X-Telegram-Id in header is required');
    }

    return await this.telegramService.getProfile(telegramId);
  }
}
