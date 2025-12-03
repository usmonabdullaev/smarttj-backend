import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/database/prisma/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(dto: LoginAuthDto, ip: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.login }, { phone: dto.login }],
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { login: dto.login, password: dto.password },
      });
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        error: { login: dto.login, password: dto.password },
      });
    }

    const existedSession = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
        fingerprint: dto.fingerprint,
      },
    });

    let sessionId: string;

    if (existedSession) {
      await this.prisma.session.update({
        where: { id: existedSession.id },
        data: {
          lastActiveAt: new Date(),
        },
      });

      sessionId = existedSession.id;
    } else {
      const newSession = await this.prisma.session.create({
        data: {
          userId: user.id,
          fingerprint: dto.fingerprint,
          userAgent,
          ip,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 дней
        },
      });

      sessionId = newSession.id;
    }

    const token = jwt.sign(
      { userId: user.id, sessionId, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async logout(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        error: sessionId,
      });
    }

    return await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }
}
