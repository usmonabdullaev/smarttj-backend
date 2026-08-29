import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class CartsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getUserCartInfo(userId: string) {
    return this.prisma.cart.findUnique({
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

  getUserCart(userId: string) {
    return this.prisma.cart.findUnique({ where: { userId } });
  }

  getItem(itemId: string) {
    return this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
  }

  updateItemQuantity(itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  deleteItem(itemId: string) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  deleteItems(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  getProductVariant(productVariantId: string, quantity?: number) {
    return this.prisma.productVariant.findFirst({
      where: {
        id: productVariantId,
        stock: {
          gte: quantity,
        },
        product: {
          status: ProductStatus.ACTIVE,
        },
      },
    });
  }

  findForAdd(userId: string, productVariantId: string) {
    return this.prisma.cart.upsert({
      where: {
        userId,
      },
      create: {
        userId,
      },
      update: {},
      include: {
        items: {
          where: { productVariantId },
        },
      },
    });
  }

  addToCart(cartId: string, productVariantId: string, quantity?: number) {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId,
        },
      },
      create: {
        cartId,
        productVariantId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }
}
