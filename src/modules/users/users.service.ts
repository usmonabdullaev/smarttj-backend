import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId, isActive: true },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        error: sessionId,
      });
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        lastActiveAt: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = session.user;

    return userWithoutPassword;
  }

  async logout() {}
}
