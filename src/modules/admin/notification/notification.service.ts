import { Injectable, NotFoundException } from '@nestjs/common';

import { SendNotificationDto } from '@/modules/admin/notification/dto/send-notification.dto';
import { NotificationService } from '@/bullmq/notification/notification.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class AdminNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async sendNotification(dto: SendNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.notification.send(dto);

    return user;
  }
}
