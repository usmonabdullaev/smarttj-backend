import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '@/common/selects/user.select';

@Injectable()
export class AdminNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { ...publicUserSelect, telegramId: true },
    });
  }
}
