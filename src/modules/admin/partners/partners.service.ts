import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartnerStatus, Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { AdminGetPartnersDto, AdminUpdatePartnerDto } from './dto';

@Injectable()
export class AdminPartnersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Список партнёров с пагинацией, поиском и фильтрацией
   */
  async getAll(query: AdminGetPartnersDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PartnerWhereInput = {
      user: {
        role: UserRole.PARTNER,
      },
      ...(query.status ? { status: query.status } : {}),
      ...(query.identification ? { identification: query.identification } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { phone1: { contains: query.q, mode: 'insensitive' } },
              { phone2: { contains: query.q, mode: 'insensitive' } },
              { email: { contains: query.q, mode: 'insensitive' } },
              { inn: { contains: query.q, mode: 'insensitive' } },
              { user: { name: { contains: query.q, mode: 'insensitive' } } },
              { user: { phone: { contains: query.q, mode: 'insensitive' } } },
              { user: { email: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              role: true,
              avatar: true,
              emailVerified: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              products: true,
              orderItems: true,
            },
          },
        },
      }),
      this.prisma.partner.count({ where }),
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
   * Получить партнёра по ID (или userId)
   */
  async getById(id: string) {
    let partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orderItems: true,
          },
        },
      },
    });

    if (!partner) {
      // Попробуем найти по userId
      partner = await this.prisma.partner.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              role: true,
              avatar: true,
              emailVerified: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              products: true,
              orderItems: true,
            },
          },
        },
      });
    }

    if (!partner) {
      throw new NotFoundException('Партнёр не найден');
    }

    return partner;
  }

  /**
   * Обновить информацию о партнёре
   */
  async update(id: string, dto: AdminUpdatePartnerDto) {
    const partner = await this.getById(id);

    return await this.prisma.partner.update({
      where: { id: partner.id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.identification !== undefined
          ? { identification: dto.identification }
          : {}),
        ...(dto.bonus !== undefined ? { bonus: dto.bonus } : {}),
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.about !== undefined ? { about: dto.about.trim() } : {}),
        ...(dto.email !== undefined
          ? { email: dto.email?.trim() || null }
          : {}),
        ...(dto.phone1 !== undefined ? { phone1: dto.phone1.trim() } : {}),
        ...(dto.phone2 !== undefined
          ? { phone2: dto.phone2?.trim() || null }
          : {}),
        ...(dto.address1 !== undefined
          ? { address1: dto.address1?.trim() || null }
          : {}),
        ...(dto.address2 !== undefined
          ? { address2: dto.address2?.trim() || null }
          : {}),
        ...(dto.inn !== undefined ? { inn: dto.inn?.trim() || null } : {}),
        ...(dto.alifTerminalId !== undefined
          ? { alifTerminalId: dto.alifTerminalId?.trim() || null }
          : {}),
        ...(dto.bankName !== undefined
          ? { bankName: dto.bankName?.trim() || null }
          : {}),
        ...(dto.bankAccount !== undefined
          ? { bankAccount: dto.bankAccount?.trim() || null }
          : {}),
        ...(dto.bik !== undefined ? { bik: dto.bik?.trim() || null } : {}),
        ...(dto.cardAccount !== undefined
          ? { cardAccount: dto.cardAccount?.trim() || null }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orderItems: true,
          },
        },
      },
    });
  }

  /**
   * Быстрое обновление статуса партнёра
   */
  async updateStatus(id: string, status: PartnerStatus) {
    const partner = await this.getById(id);

    return await this.prisma.partner.update({
      where: { id: partner.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orderItems: true,
          },
        },
      },
    });
  }

  /**
   * Удаление партнёра (с проверкой на наличие товаров и заказов)
   */
  async delete(id: string) {
    const partner = await this.getById(id);

    if (partner._count.orderItems > 0) {
      throw new ConflictException(
        `Нельзя удалить партнёра с историей заказов (кол-во позиций: ${partner._count.orderItems}). Вы можете заблокировать его через статус BLOCKED.`,
      );
    }

    if (partner._count.products > 0) {
      throw new ConflictException(
        `Нельзя удалить партнёра, у которого есть товары (кол-во: ${partner._count.products}). Сначала удалите или переместите его товары.`,
      );
    }

    await this.prisma.partner.delete({
      where: { id: partner.id },
    });

    return {
      success: true,
      message: 'Партнёр успешно удален',
    };
  }
}
