import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { PasswordService } from '@/common/services/password/password.service';
import {
  AdminCreateAdminDto,
  AdminGetAdminsDto,
  AdminUpdateAdminDto,
} from './dto';

const ADMIN_ROLES: UserRole[] = [
  UserRole.SYSADMIN,
  UserRole.ADMIN,
  UserRole.MODERATOR,
];

const ADMIN_SELECT_FIELDS = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  avatar: true,
  emailVerified: true,
  regionId: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AdminAdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Список администраторов (SYSADMIN, ADMIN, MODERATOR) с пагинацией и фильтрами
   */
  async getAll(query: AdminGetAdminsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: query.role ? query.role : { in: ADMIN_ROLES },
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { phone: { contains: query.q, mode: 'insensitive' } },
              { email: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
        select: ADMIN_SELECT_FIELDS,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить детальную информацию об администраторе
   */
  async getById(id: string) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        role: { in: ADMIN_ROLES },
      },
      select: ADMIN_SELECT_FIELDS,
    });

    if (!admin) {
      throw new NotFoundException('Администратор не найден');
    }

    return admin;
  }

  /**
   * Создать нового администратора (только для SYSADMIN)
   */
  async create(dto: AdminCreateAdminDto) {
    if (!ADMIN_ROLES.includes(dto.role)) {
      throw new BadRequestException(
        'Недопустимая роль. Разрешены только ADMIN, SYSADMIN и MODERATOR',
      );
    }

    const cleanPhone = dto.phone.trim();
    const cleanEmail = dto.email?.trim() || null;

    // Проверка уникальности телефона для заданной роли
    const existingPhone = await this.prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        role: dto.role,
      },
    });

    if (existingPhone) {
      throw new ConflictException(
        'Администратор с таким номером телефона и ролью уже существует',
      );
    }

    if (cleanEmail) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: cleanEmail,
          role: dto.role,
        },
      });

      if (existingEmail) {
        throw new ConflictException(
          'Администратор с таким email и ролью уже существует',
        );
      }
    }

    const hashedPassword = await this.passwordService.hash(dto.password);

    return await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password: hashedPassword,
        role: dto.role,
      },
      select: ADMIN_SELECT_FIELDS,
    });
  }

  /**
   * Обновить информацию об администраторе (только для SYSADMIN)
   */
  async update(id: string, dto: AdminUpdateAdminDto, currentUserId: string) {
    const admin = await this.getById(id);

    const targetRole = dto.role ?? admin.role;
    const targetPhone = dto.phone ? dto.phone.trim() : admin.phone;
    const targetEmail =
      dto.email !== undefined ? dto.email?.trim() || null : admin.email;

    // Если меняется роль
    if (dto.role && dto.role !== admin.role) {
      if (!ADMIN_ROLES.includes(dto.role)) {
        throw new BadRequestException(
          'Недопустимая роль. Разрешены только ADMIN, SYSADMIN и MODERATOR',
        );
      }

      if (admin.id === currentUserId) {
        throw new BadRequestException(
          'Вы не можете изменить роль собственного аккаунта',
        );
      }

      if (admin.role === UserRole.SYSADMIN && dto.role !== UserRole.SYSADMIN) {
        const sysadminCount = await this.prisma.user.count({
          where: { role: UserRole.SYSADMIN },
        });

        if (sysadminCount <= 1) {
          throw new BadRequestException(
            'Нельзя понизить роль единственного системного администратора в системе',
          );
        }
      }
    }

    // Проверка уникальности телефона при изменении
    if (dto.phone || (dto.role && dto.role !== admin.role)) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: targetPhone,
          role: targetRole,
          id: { not: id },
        },
      });

      if (existingPhone) {
        throw new ConflictException(
          'Администратор с таким номером телефона и ролью уже существует',
        );
      }
    }

    // Проверка уникальности email при изменении
    if (targetEmail && (dto.email || (dto.role && dto.role !== admin.role))) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: targetEmail,
          role: targetRole,
          id: { not: id },
        },
      });

      if (existingEmail) {
        throw new ConflictException(
          'Администратор с таким email и ролью уже существует',
        );
      }
    }

    let password: string | undefined;
    if (dto.password) {
      password = await this.passwordService.hash(dto.password);
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.phone ? { phone: targetPhone } : {}),
        ...(dto.email !== undefined ? { email: targetEmail } : {}),
        ...(dto.role ? { role: dto.role } : {}),
        ...(password ? { password } : {}),
      },
      select: ADMIN_SELECT_FIELDS,
    });
  }

  /**
   * Удалить администратора (только для SYSADMIN)
   */
  async delete(id: string, currentUserId: string) {
    const admin = await this.getById(id);

    if (admin.id === currentUserId) {
      throw new BadRequestException(
        'Вы не можете удалить собственный аккаунт администратора',
      );
    }

    if (admin.role === UserRole.SYSADMIN) {
      const sysadminCount = await this.prisma.user.count({
        where: { role: UserRole.SYSADMIN },
      });

      if (sysadminCount <= 1) {
        throw new BadRequestException(
          'Нельзя удалить единственного системного администратора в системе',
        );
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Администратор успешно удален',
    };
  }
}
