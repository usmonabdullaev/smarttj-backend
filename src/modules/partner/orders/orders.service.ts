import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderDeliveryStatus,
  OrderItemDeliveryStatus,
  Prisma,
} from '@prisma/client';

import { PartnerOrdersRepository } from './orders.repository';
import {
  GetPartnerOrdersDto,
  UpdateOrderDeliveryStatusDto,
  UpdateOrderItemDeliveryStatusDto,
} from './dto';

@Injectable()
export class PartnerOrdersService {
  constructor(private readonly ordersRepository: PartnerOrdersRepository) {}

  /**
   * Получить список заказов, в которых есть товары партнёра
   */
  async getList(partnerId: string, query: GetPartnerOrdersDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      // Заказ обязательно должен содержать товары этого партнёра
      items: {
        some: {
          productVariant: {
            product: { partnerId },
          },
          ...(query.itemDeliveryStatus && {
            deliveryStatus: query.itemDeliveryStatus,
          }),
        },
      },
      ...(query.deliveryStatus && { deliveryStatus: query.deliveryStatus }),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.type && { type: query.type }),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { id: { contains: query.q, mode: 'insensitive' } },
              {
                user: {
                  OR: [
                    { name: { contains: query.q, mode: 'insensitive' } },
                    { phone: { contains: query.q } },
                  ],
                },
              },
              {
                items: {
                  some: {
                    productVariant: {
                      product: {
                        partnerId,
                        title: { contains: query.q, mode: 'insensitive' },
                      },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      this.ordersRepository.findManyByPartner(partnerId, where, skip, limit),
      this.ordersRepository.countByPartner(where),
    ]);

    // Рассчитываем сумму товаров партнёра в каждом заказе
    const formattedOrders = orders.map((order) => {
      const partnerTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        ...order,
        partnerTotal,
      };
    });

    return {
      data: formattedOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить заказ партнёра по ID
   */
  async getById(orderId: string, partnerId: string) {
    const order = await this.ordersRepository.findByIdAndPartner(
      orderId,
      partnerId,
    );

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        error: orderId,
      });
    }

    const partnerTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      ...order,
      partnerTotal,
    };
  }

  /**
   * Обновить статус доставки конкретной позиции заказа
   */
  async updateItemDeliveryStatus(
    orderId: string,
    itemId: string,
    partnerId: string,
    dto: UpdateOrderItemDeliveryStatusDto,
  ) {
    const item = await this.ordersRepository.findOrderItem(itemId, partnerId);

    if (!item) {
      throw new NotFoundException({
        message: 'Order item not found or does not belong to partner',
        code: 'ORDER_ITEM_NOT_FOUND',
        error: itemId,
      });
    }

    if (item.orderId !== orderId) {
      throw new BadRequestException({
        message: 'Order item does not belong to this order',
        code: 'ORDER_ITEM_MISMATCH',
      });
    }

    const receivedAt =
      dto.deliveryStatus === OrderItemDeliveryStatus.RECEIVED
        ? new Date()
        : undefined;

    await this.ordersRepository.updateOrderItemStatus(
      itemId,
      dto.deliveryStatus,
      receivedAt,
    );

    // Синхронизируем общий статус доставки заказа
    await this.syncOrderDeliveryStatus(orderId);

    return await this.getById(orderId, partnerId);
  }

  /**
   * Пакетно обновить статус доставки всех товаров партнёра в заказе
   */
  async updateOrderDeliveryStatus(
    orderId: string,
    partnerId: string,
    dto: UpdateOrderDeliveryStatusDto,
  ) {
    // Проверяем существование заказа и принадлежность товаров партнёру
    await this.getById(orderId, partnerId);

    const receivedAt =
      dto.deliveryStatus === OrderItemDeliveryStatus.RECEIVED
        ? new Date()
        : undefined;

    await this.ordersRepository.updatePartnerOrderItemsStatus(
      orderId,
      partnerId,
      dto.deliveryStatus,
      receivedAt,
    );

    // Синхронизируем общий статус доставки заказа
    await this.syncOrderDeliveryStatus(orderId);

    return await this.getById(orderId, partnerId);
  }

  /**
   * Синхронизация общего статуса заказа Order.deliveryStatus
   * на основе статусов всех OrderItem данного заказа
   */
  private async syncOrderDeliveryStatus(orderId: string) {
    const allItems =
      await this.ordersRepository.getAllOrderItemsStatus(orderId);

    if (!allItems.length) return;

    // eslint-disable-next-line no-useless-assignment
    let newStatus: OrderDeliveryStatus = OrderDeliveryStatus.NEW;

    const allReceived = allItems.every(
      (i) => i.deliveryStatus === OrderItemDeliveryStatus.RECEIVED,
    );
    const allDeliveredOrReceived = allItems.every(
      (i) =>
        i.deliveryStatus === OrderItemDeliveryStatus.DELIVERED ||
        i.deliveryStatus === OrderItemDeliveryStatus.RECEIVED,
    );
    const someDeliveredOrReceived = allItems.some(
      (i) =>
        i.deliveryStatus === OrderItemDeliveryStatus.DELIVERED ||
        i.deliveryStatus === OrderItemDeliveryStatus.RECEIVED ||
        i.deliveryStatus === OrderItemDeliveryStatus.AT_PICKUP_POINT,
    );
    const allReturned = allItems.every(
      (i) => i.deliveryStatus === OrderItemDeliveryStatus.RETURNED,
    );

    if (allReceived) {
      newStatus = OrderDeliveryStatus.RECEIVED;
    } else if (allDeliveredOrReceived) {
      newStatus = OrderDeliveryStatus.DELIVERED;
    } else if (someDeliveredOrReceived) {
      newStatus = OrderDeliveryStatus.PARTIALLY_DELIVERED;
    } else if (allReturned) {
      newStatus = OrderDeliveryStatus.RETURNED;
    } else {
      newStatus = OrderDeliveryStatus.NEW;
    }

    await this.ordersRepository.updateOrderDeliveryStatus(orderId, newStatus);
  }
}
