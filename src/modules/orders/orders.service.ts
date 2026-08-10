import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderDeliveryStatus,
  OrderPaymentStatus,
  OrderUIStatus,
  ProductStatus,
} from '@prisma/client';

import { CheckoutOrderDto } from '@/modules/orders/dto/checkout-order.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId, uiStatus: OrderUIStatus.SHOW },
      include: {
        paymentMethod: true,
        shop: true,
        address: true,
        items: {
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
        },
      },
    });
  }

  async getArchive(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId, uiStatus: OrderUIStatus.ARCHIVED },
      include: {
        paymentMethod: true,
        shop: true,
        address: true,
        items: {
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
        },
      },
    });
  }

  async checkout(dto: CheckoutOrderDto, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              productVariant: {
                select: {
                  id: true,
                  price: true,
                  discount: true,
                  stock: true,
                  product: {
                    select: { status: true, warranty: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let total = 0;
      const orderItemsData: {
        productVariantId: string;
        quantity: number;
        warranty: number | null;
        price: number;
      }[] = [];

      for (const item of cart.items) {
        const variant = item.productVariant;

        if (!variant || variant.product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException('Product variant not available');
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException('Not enough stock for product variant');
        }

        const price =
          variant.discount && variant.discount > 0
            ? variant.discount
            : variant.price;

        total += price * item.quantity;

        orderItemsData.push({
          productVariantId: variant.id,
          quantity: item.quantity,
          warranty: variant.product.warranty,
          price,
        });
      }

      for (const item of orderItemsData) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Product variant was purchased by someone else, try again',
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          type: dto.type,
          paymentMethodId: dto.paymentMethodId,
          comment: dto.comment,
          shopId: dto.shopId,
          addressId: dto.addressId,
          totalPrice: total,
        },
      });

      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          orderId: order.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          warranty: item.warranty,
        })),
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }

  async delete(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
        uiStatus: {
          not: OrderUIStatus.DELETED,
        },
        paymentStatus: {
          in: [OrderPaymentStatus.PAID, OrderPaymentStatus.REFUNDED],
        },
        deliveryStatus: {
          in: [OrderDeliveryStatus.RECEIVED, OrderDeliveryStatus.RETURNED],
        },
      },
    });

    if (!order) {
      throw new NotFoundException();
    }

    return await this.prisma.order.update({
      where: { id },
      data: {
        uiStatus: OrderUIStatus.DELETED,
      },
    });
  }
}
