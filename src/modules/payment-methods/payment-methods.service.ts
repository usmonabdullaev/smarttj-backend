import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto) {
    return await this.prisma.paymentMethod.create({
      data: {
        name: dto.name,
        type: dto.type,
        isActive: dto.isActive,
      },
    });
  }

  async findAll() {
    return await this.prisma.paymentMethod.findMany();
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
        name: dto.name,
        type: dto.type,
        isActive: dto.isActive,
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
