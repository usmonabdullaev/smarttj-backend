import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, isActive: true },
    });

    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        error: sessionId,
      });
    }

    const sessions = await this.prisma.session.findMany({
      where: { userId, NOT: { id: sessionId } },
      orderBy: { createdAt: 'desc' },
    });

    return { current: session, list: sessions };
  }

  async remove(id: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
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
