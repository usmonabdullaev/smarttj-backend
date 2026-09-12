import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  AdminCreatePaymentMethodDto,
  AdminUpdatePaymentMethodDto,
} from './dto';

@Injectable()
export class AdminPaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async getById(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException({
        message: 'Payment method not found',
        code: 'PAYMENT_METHOD_NOT_FOUND',
        error: id,
      });
    }

    return paymentMethod;
  }

  async create(dto: AdminCreatePaymentMethodDto) {
    if (dto.code) {
      const existing = await this.prisma.paymentMethod.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException({
          message: `Способ оплаты с кодом "${dto.code}" уже существует`,
          code: 'PAYMENT_METHOD_CODE_EXISTS',
          error: dto.code,
        });
      }
    }

    return await this.prisma.paymentMethod.create({
      data: {
        code: dto.code,
        name: dto.name,
        provider: dto.provider,
        icon: dto.icon,
        type: dto.type,
        isActive: dto.isActive ?? true,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async update(id: string, dto: AdminUpdatePaymentMethodDto) {
    await this.getById(id);

    if (dto.code) {
      const existing = await this.prisma.paymentMethod.findFirst({
        where: {
          code: dto.code,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException({
          message: `Способ оплаты с кодом "${dto.code}" уже существует`,
          code: 'PAYMENT_METHOD_CODE_EXISTS',
          error: dto.code,
        });
      }
    }

    return await this.prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.provider !== undefined && { provider: dto.provider }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async toggle(id: string) {
    const paymentMethod = await this.getById(id);

    return await this.prisma.paymentMethod.update({
      where: { id },
      data: {
        isActive: !paymentMethod.isActive,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async delete(id: string) {
    const paymentMethod = await this.getById(id);

    if (paymentMethod._count.orders > 0) {
      throw new ConflictException({
        message:
          'Невозможно удалить способ оплаты, так как к нему привязаны оформленные заказы. Рекомендуется отключить его (toggle).',
        code: 'PAYMENT_METHOD_HAS_ORDERS',
        error: { id, ordersCount: paymentMethod._count.orders },
      });
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Способ оплаты успешно удален',
    };
  }
}
