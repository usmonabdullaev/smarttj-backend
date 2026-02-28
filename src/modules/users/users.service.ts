import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma/prisma.service';
import { SetPasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { LoggerService } from '../../logger/logger.service';

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

  async update(id: string, dto: UpdateUserDto, avatarId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

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

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        regionId: dto.regionId || undefined,
        ...(avatarId && { avatarId }),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  async setPassword(dto: SetPasswordDto, userId: string, sessionId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    if (user.password) {
      const same = await bcrypt.compare(dto.password, user.password);
      if (same) {
        throw new BadRequestException({
          message: 'New password must be different',
        });
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
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
