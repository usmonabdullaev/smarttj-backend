import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderDeliveryStatus,
  OrderPaymentStatus,
  OrderUIStatus,
  ProductStatus,
} from '@prisma/client';

import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
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

  async create(dto: CreateOrderDto, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const carts = await tx.cart.findMany({
        where: { userId },
        include: {
          productVariant: {
            include: {
              product: true,
            },
          },
        },
      });

      if (carts.length === 0) {
        throw new BadRequestException();
      }

      const orderItemsData = carts.map((item) => {
        const variant = item.productVariant;

        if (!variant || variant.product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException({ message: 'Product not available' });
        }

        const price =
          variant.discount && +variant.discount > 0
            ? +variant.discount
            : +variant.price;

        return {
          productVariantId: variant.id,
          quantity: item.quantity,
          warranty: variant.product.warranty,
          price, // snapshot
        };
      });

      const order = await tx.order.create({
        data: {
          userId,
          type: dto.type,
          paymentMethodId: dto.paymentMethodId,
          comment: dto.comment,
          shopId: dto.shopId,
          addressId: dto.addressId,
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

      await tx.cart.deleteMany({ where: { userId } });

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
