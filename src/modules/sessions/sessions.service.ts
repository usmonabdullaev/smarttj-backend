import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, sessionId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: userId,
      });
    }

    const sessions = user.sessions
      .map((session) => ({
        ...session,
        current: session.id === sessionId,
      }))
      .sort((a, b) => +b.current - +a.current);

    return sessions;
  }

  async remove(id: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id, NOT: { id: sessionId } },
    });

    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        error: id,
      });
    }

    return await this.prisma.session.delete({ where: { id } });
  }
}
