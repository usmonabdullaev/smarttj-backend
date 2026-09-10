import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationTelegramService } from '@/bullmq/notification-telegram/notification-telegram.service';
import { NotificationService } from '@/bullmq/notification/notification.service';
import { AdminNotificationRepository } from './notification.repository';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class AdminNotificationService {
  constructor(
    private readonly notification: NotificationService,
    private readonly repository: AdminNotificationRepository,
    private readonly notificationTelegram: NotificationTelegramService,
  ) {}

  async sendNotification(dto: SendNotificationDto) {
    const user = await this.repository.getUserById(dto.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.notification.send(dto);

    if (user.telegramId) {
      const message =
        `🔔 <b>${this.escapeHtml(dto.title)}</b>\n\n` +
        `<blockquote>${this.escapeHtml(dto.message)}</blockquote>`;

      await this.notificationTelegram.send({
        telegramId: user.telegramId,
        message,
      });
    }

    return user;
  }

  private escapeHtml(text: string = ''): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
