import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCartDto } from '@/modules/carts/dto/create-cart.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { EditCartDto } from '@/modules/carts/dto/edit-cart.dto';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(userId: string) {
    return await this.prisma.cart.findMany({
      where: { userId },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                model: true,
                region: true,
                reviews: {
                  take: 10,
                  include: {
                    user: {
                      select: userSelect,
                    },
                  },
                },
              },
            },
            images: true,
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
      },
    });
  }

  async create(dto: CreateCartDto, userId: string) {
    const productVariant = await this.prisma.productVariant.findUnique({
      where: { id: dto.productVariantId },
    });

    if (!productVariant) {
      throw new NotFoundException();
    }

    return await this.prisma.cart.create({
      data: {
        userId,
        productVariantId: dto.productVariantId,
        quantity: dto.quantity,
      },
    });
  }

  async edit(dto: EditCartDto, id: string, userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { id, userId } });

    if (!cart) {
      throw new NotFoundException();
    }

    const quantity =
      dto.quantity === 'increment' ? { increment: 1 } : { decrement: 1 };

    return await this.prisma.cart.update({
      where: { id },
      data: {
        quantity,
      },
    });
  }

  async delete(id: string, userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { id, userId } });

    if (!cart) {
      throw new NotFoundException();
    }

    return await this.prisma.cart.delete({ where: { id } });
  }
}
