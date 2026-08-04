import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class TelegramService {
  constructor(private prisma: PrismaService) {}

  async getProfile(telegramId: string) {
    const user = await this.prisma.user.findFirst({
      where: { telegramId },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: telegramId,
      });
    }

    return user;
  }
}
