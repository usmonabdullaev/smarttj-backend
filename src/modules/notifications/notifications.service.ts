import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly repository: NotificationsRepository) {}

  async getAll(userId: string) {
    return await this.repository.findAll(userId);
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.repository.countUnread(userId);
    return { unreadCount };
  }

  async getById(id: string, userId: string) {
    const notification = await this.repository.findById(id);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return await this.repository.read(id);
  }

  async readAll(userId: string) {
    return await this.repository.readAll(userId);
  }
}
