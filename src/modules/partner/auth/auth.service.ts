import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register() {
    const users = await this.prisma.user.findMany({
      select: userSelect,
    });

    return users;
  }
}
