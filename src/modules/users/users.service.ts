import * as argon2 from 'argon2';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';
import { LoggerService } from '@/logger/logger.service';
import {
  SetPasswordDto,
  UpdateUserDto,
} from '@/modules/users/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly logger: LoggerService,
  ) {}

  async getMe(sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, isActive: true },
      include: {
        user: {
          select: userSelect,
        },
      },
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

    return session.user;
  }

  async update(id: string, dto: UpdateUserDto, avatarId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        avatarId: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        error: id,
      });
    }

    if (avatarId && user.avatarId && user.avatarId !== avatarId) {
      try {
        await this.cloudinary.deleteFile(user.avatarId);
      } catch (error) {
        this.logger.error('Ошибка при удалении изображения [update/avatar]', {
          error,
        });
      }
    }

    if (dto.email) {
      const existed = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          role: user.role,
          id: {
            not: id,
          },
        },
        select: { id: true },
      });

      if (existed) {
        throw new ConflictException();
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        regionId: dto.regionId,
        telegramId: dto.telegramId,
        avatar: dto.avatar,
        avatarId,
        emailVerified: dto.email
          ? dto.email === user.email
            ? undefined
            : false
          : undefined,
      },
      select: userSelect,
    });

    return updatedUser;
  }

  async setPassword(dto: SetPasswordDto, userId: string, sessionId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    if (user.password) {
      const same = await argon2.verify(user.password, dto.password);

      if (same) {
        throw new BadRequestException({
          message: 'New password must be different',
        });
      }
    }

    const hashed = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
      },
    });

    if (dto.terminateOtherSessions) {
      await this.prisma.session.updateMany({
        where: {
          userId,
          id: { not: sessionId },
          isActive: true,
        },
        data: { isActive: false },
      });
    }

    return { success: true, message: 'Password changed' };
  }
}
