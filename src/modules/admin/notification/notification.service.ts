import { Injectable, NotFoundException } from '@nestjs/common';

import { SendNotificationDto } from '@/modules/admin/notification/dto/send-notification.dto';
import { NotificationService } from '@/bullmq/notification/notification.service';
import { UserRepository } from '@/common/repositories/user.repository';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class AdminNotificationService {
  constructor(
    private readonly notification: NotificationService,
    private readonly userRepository: UserRepository,
  ) {}

  async sendNotification(dto: SendNotificationDto) {
    const user = await this.userRepository.findById(dto.userId, userSelect);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.notification.send(dto);

    return user;
  }
}
