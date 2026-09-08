import { Injectable } from '@nestjs/common';
import {
  OrderDeliveryStatus,
  OrderItemDeliveryStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class PartnerOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить список заказов, содержащих товары партнёра
   */
  async findManyByPartner(
    partnerId: string,
    where: Prisma.OrderWhereInput,
    skip: number,
    take: number,
  ) {
    return this.prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        paymentMethod: true,
        address: true,
        items: {
          where: {
            productVariant: {
              product: { partnerId },
            },
          },
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    warranty: true,
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
   * Количество заказов по фильтру
   */
  async countByPartner(where: Prisma.OrderWhereInput): Promise<number> {
    return this.prisma.order.count({ where });
  }

  /**
   * Получить конкретный заказ партнёра со всеми товарами партнёра в нём
   */
  async findByIdAndPartner(orderId: string, partnerId: string) {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            productVariant: {
              product: { partnerId },
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        paymentMethod: true,
        address: true,
        items: {
          where: {
            productVariant: {
              product: { partnerId },
            },
          },
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    warranty: true,
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
   * Найти позицию заказа с проверкой принадлежности партнёру
   */
  async findOrderItem(orderItemId: string, partnerId: string) {
    return this.prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        productVariant: {
          product: { partnerId },
        },
      },
      include: {
        order: true,
      },
    });
  }

  /**
   * Обновить статус доставки конкретной позиции
   */
  async updateOrderItemStatus(
    orderItemId: string,
    status: OrderItemDeliveryStatus,
    receivedAt?: Date,
  ) {
    return this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        deliveryStatus: status,
        ...(receivedAt !== undefined && { receivedAt }),
      },
    });
  }

  /**
   * Обновить статус доставки всех позиций партнёра в заказе
   */
  async updatePartnerOrderItemsStatus(
    orderId: string,
    partnerId: string,
    status: OrderItemDeliveryStatus,
    receivedAt?: Date,
  ) {
    return this.prisma.orderItem.updateMany({
      where: {
        orderId,
        productVariant: {
          product: { partnerId },
        },
      },
      data: {
        deliveryStatus: status,
        ...(receivedAt !== undefined && { receivedAt }),
      },
    });
  }

  /**
   * Получить все статусы элементов заказа для последующей синхронизации общего статуса
   */
  async getAllOrderItemsStatus(orderId: string) {
    return this.prisma.orderItem.findMany({
      where: { orderId },
      select: { deliveryStatus: true },
    });
  }

  /**
   * Обновить общий статус доставки заказа
   */
  async updateOrderDeliveryStatus(
    orderId: string,
    status: OrderDeliveryStatus,
  ) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { deliveryStatus: status },
    });
  }
}
