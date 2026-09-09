import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { TelegramCodeStore } from '@/modules/telegram/telegram-code.store';
import {
  TelegramLinkCodeResponseDto,
  TelegramStatusResponseDto,
} from './dto';

@Injectable()
export class PartnerTelegramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeStore: TelegramCodeStore,
  ) {}

  /**
   * Получить статус привязки Telegram для текущего партнёра
   */
  async getStatus(userId: string): Promise<TelegramStatusResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || null;

    return {
      connected: Boolean(user.telegramId),
      telegramId: user.telegramId,
      botUsername,
    };
  }

  /**
   * Сгенерировать одноразовый код и deep link для привязки Telegram-бота
   */
  async generateLinkCode(
    userId: string,
    partnerId: string,
  ): Promise<TelegramLinkCodeResponseDto> {
    const code = this.codeStore.generateCode();
    const expiresInSeconds = 900; // 15 минут

    await this.codeStore.setLinkCode(
      code,
      { userId, partnerId },
      expiresInSeconds,
    );

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || null;
    const linkUrl = botUsername
      ? `https://t.me/${botUsername}?start=link_${code}`
      : `link_${code}`;

    return {
      code,
      linkUrl,
      botUsername,
      expiresInSeconds,
    };
  }

  /**
   * Отвязать Telegram-аккаунт партнёра
   */
  async disconnect(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { telegramId: null },
    });

    return {
      success: true,
      message: 'Telegram successfully disconnected',
    };
  }
}
