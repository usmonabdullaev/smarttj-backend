import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { TelegramService } from '@/modules/telegram/telegram.service';
import { ReceiptTemplate } from '@/pdf/templates';
import { PdfService } from '@/pdf/pdf.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly telegramService: TelegramService,
  ) {}

  async getList(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId, uiStatus: OrderUIStatus.SHOW },
      include: {
        paymentMethod: true,
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

  /**
   * Получить детальную информацию по конкретному заказу пользователя
   */
  async getById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        paymentMethod: true,
        address: true,
        transaction: true,
        paymentAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
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

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому заказу');
    }

    return order;
  }

  /**
   * Сменить способ оплаты для неоплаченного заказа
   */
  async updatePaymentMethod(
    orderId: string,
    paymentMethodId: string,
    userId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('У вас нет прав на изменение этого заказа');
    }

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new ConflictException('Оплаченный заказ нельзя изменить');
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId, isActive: true },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        'Выбранный способ оплаты не найден или неактивен',
      );
    }

    return await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentMethodId },
      include: {
        paymentMethod: true,
      },
    });
  }

  /**
   * Получить электронный чек в формате JSON для UI
   */
  async getReceiptJson(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        paymentMethod: true,
        address: true,
        transaction: true,
        user: { select: userSelect },
        items: {
          include: {
            productVariant: {
              include: {
                product: { select: { title: true } },
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому чеку');
    }

    return {
      orderId: order.id,
      receiptNumber:
        order.transaction?.providerId || order.id.slice(0, 8).toUpperCase(),
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      paymentMethod: {
        id: order.paymentMethod.id,
        name: order.paymentMethod.name,
        code: order.paymentMethod.code,
        type: order.paymentMethod.type,
        provider: order.paymentMethod.provider,
        icon: order.paymentMethod.icon,
      },
      transaction: order.transaction
        ? {
            id: order.transaction.id,
            provider: order.transaction.provider,
            providerId: order.transaction.providerId,
            payerAccount: order.transaction.payerAccount,
            payerPhone: order.transaction.payerPhone,
            paymentGate: order.transaction.paymentGate,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        title:
          item.productTitle || item.productVariant?.product.title || 'Товар',
        image: item.productImage || item.productVariant?.images[0]?.url || null,
        sku: item.productSku || null,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        warranty: item.warranty,
      })),
      totalPrice: order.totalPrice,
      customer: {
        name: order.user?.name,
        phone: order.user?.phone,
        email: order.user?.email,
      },
      address: order.address,
    };
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        paymentMethod: true,
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

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
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
    const order = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              productVariant: {
                select: {
                  id: true,
                  code: true,
                  label: true,
                  price: true,
                  discount: true,
                  stock: true,
                  images: {
                    take: 1,
                    select: { url: true },
                    orderBy: { order: 'asc' },
                  },
                  product: {
                    select: {
                      title: true,
                      status: true,
                      warranty: true,
                      partnerId: true,
                    },
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
        partnerId: string | null;
        productTitle: string | null;
        productImage: string | null;
        productSku: string | null;
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
          partnerId: variant.product.partnerId || null,
          productTitle: variant.product.title || null,
          productImage: variant.images[0]?.url || null,
          productSku: variant.label || String(variant.code),
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
          partnerId: item.partnerId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          productSku: item.productSku,
          quantity: item.quantity,
          price: item.price,
          warranty: item.warranty,
        })),
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    // Отправляем уведомления партнёрам в Telegram (асинхронно)
    void this.telegramService.notifyPartnersAboutNewOrder(order.id);

    return order;
  }

  async delete(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
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
      where: { id: orderId },
      data: {
        uiStatus: OrderUIStatus.DELETED,
      },
    });
  }

  async exportReceipt(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        paymentMethod: true,
        address: true,
        user: {
          select: userSelect,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const buffer = await this.pdfService.generate({
      template: new ReceiptTemplate(),
      data: order,
    });

    return { order, buffer };
  }
}
