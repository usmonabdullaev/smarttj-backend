import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePaymentMethodDto } from '@/modules/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/modules/payment-methods/dto/update-payment-method.dto';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto) {
    return await this.prisma.paymentMethod.create({
      data: {
        code: dto.code,
        name: dto.name,
        provider: dto.provider,
        icon: dto.icon,
        type: dto.type,
        isActive: dto.isActive,
      },
    });
  }

  async findAll(activeOnly = true) {
    return await this.prisma.paymentMethod.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
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

  async update(id: string, dto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException({
        message: 'Payment method not found',
        code: 'PAYMENT_METHOD_NOT_FOUND',
        error: id,
      });
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
    });
  }

  async remove(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!paymentMethod) {
      throw new NotFoundException({
        message: 'Payment method not found',
        code: 'PAYMENT_METHOD_NOT_FOUND',
        error: id,
      });
    }

    if (paymentMethod._count.orders) {
      throw new ConflictException({
        message:
          'Payment method cannot be deleted, because it has related orders',
        code: 'PAYMENT_METHOD_HAS_ORDERS',
        error: { id, orders: paymentMethod._count.orders },
      });
    }

    return await this.prisma.paymentMethod.delete({ where: { id } });
  }
}
