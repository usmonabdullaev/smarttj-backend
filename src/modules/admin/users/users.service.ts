import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '@/common/selects/user.select';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const users = await this.prisma.user.findMany({
      select: publicUserSelect,
    });

    return users;
  }
}
