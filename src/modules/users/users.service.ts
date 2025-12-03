import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

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
        console.warn(
          `Ошибка при удалении старого изображения: ${error.message}`,
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        ...(avatarId && { avatarId }),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}
