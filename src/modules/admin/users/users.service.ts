import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '@/common/selects/user.select';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: publicUserSelect,
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
