import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { AddToCartDto } from '@/modules/carts/dto/add-to-cart.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { EditCartDto } from '@/modules/carts/dto/edit-cart.dto';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    return await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    brand: true,
                    model: true,
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
        },
      },
    });
  }

  async addToCart(dto: AddToCartDto, userId: string) {
    const productVariant = await this.prisma.productVariant.findFirst({
      where: {
        id: dto.productVariantId,
        product: {
          status: ProductStatus.ACTIVE,
        },
      },
    });

    if (!productVariant) {
      throw new NotFoundException();
    }

    const cart = await this.prisma.cart.upsert({
      where: {
        userId,
      },
      create: {
        userId,
      },
      update: {},
    });

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: dto.productVariantId,
        },
      },
      create: {
        cartId: cart.id,
        productVariantId: dto.productVariantId,
        quantity: dto.quantity,
      },
      update: {
        quantity: {
          increment: dto.quantity,
        },
      },
    });

    return { success: true, message: 'Product added to cart' };
  }

  async edit(dto: EditCartDto, id: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      throw new NotFoundException();
    }

    return await this.prisma.cartItem.update({
      where: { id },
      data: {
        quantity: dto.quantity,
      },
    });
  }

  async deleteItem(id: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      throw new NotFoundException();
    }

    return await this.prisma.cartItem.delete({ where: { id } });
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      return { message: 'Cart cleared', success: true };
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { message: 'Cart cleared', success: true };
  }
}
