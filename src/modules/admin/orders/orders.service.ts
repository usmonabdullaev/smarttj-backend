import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderDeliveryStatus,
  OrderItemDeliveryStatus,
  OrderPaymentStatus,
  OrderUIStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import { PdfService } from '@/pdf/pdf.service';
import { ReceiptTemplate } from '@/pdf/templates';
import {
  CancelAdminOrderDto,
  GetAdminOrdersDto,
  UpdateAdminOrderStatusDto,
  UpdateAdminPaymentStatusDto,
} from './dto';

const ADMIN_ORDER_USER_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  avatar: true,
} as const;

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async getAll(query: GetAdminOrdersDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.deliveryStatus && { deliveryStatus: query.deliveryStatus }),
      ...(query.type && { type: query.type }),
      ...(query.userId && { userId: query.userId }),
      ...(query.partnerId && {
        items: {
          some: {
            OR: [
              { partnerId: query.partnerId },
              {
                productVariant: {
                  product: { partnerId: query.partnerId },
                },
              },
            ],
          },
        },
      }),
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
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: ADMIN_ORDER_USER_SELECT },
          paymentMethod: true,
          address: true,
          _count: { select: { items: true } },
          items: {
            take: 3,
            include: {
              partner: { select: { id: true, title: true } },
              productVariant: {
                select: {
                  id: true,
                  images: { take: 1 },
                  product: { select: { id: true, title: true, slug: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: ADMIN_ORDER_USER_SELECT },
        paymentMethod: true,
        address: {
          include: {
            region: true,
          },
        },
        transaction: true,
        paymentAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        items: {
          include: {
            partner: {
              select: {
                id: true,
                title: true,
                phone1: true,
                email: true,
              },
            },
            productVariant: {
              include: {
                images: true,
                attributes: {
                  include: {
                    attribute: true,
                    attributeValue: true,
                  },
                },
                product: {
                  include: {
                    category: true,
                    brand: true,
                    model: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        error: id,
      });
    }

    return order;
  }

  async updateDeliveryStatus(id: string, dto: UpdateAdminOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        error: id,
      });
    }

    const isReceived = dto.deliveryStatus === OrderDeliveryStatus.RECEIVED;
    const now = new Date();

    return await this.prisma.$transaction(async (tx) => {
      // Если весь заказ доставлен покупателю — обновляем также все позиции заказа
      if (isReceived) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: {
            deliveryStatus: OrderItemDeliveryStatus.RECEIVED,
            receivedAt: now,
          },
        });
      } else if (dto.deliveryStatus === OrderDeliveryStatus.DELIVERED) {
        await tx.orderItem.updateMany({
          where: { orderId: id },
          data: { deliveryStatus: OrderItemDeliveryStatus.DELIVERED },
        });
      }

      return await tx.order.update({
        where: { id },
        data: { deliveryStatus: dto.deliveryStatus },
        include: {
          user: { select: ADMIN_ORDER_USER_SELECT },
          paymentMethod: true,
          items: true,
        },
      });
    });
  }

  async updatePaymentStatus(id: string, dto: UpdateAdminPaymentStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        error: id,
      });
    }

    const data: Prisma.OrderUpdateInput = {
      paymentStatus: dto.paymentStatus,
    };

    if (dto.paymentStatus === OrderPaymentStatus.PAID && !order.paidAt) {
      data.paidAt = new Date();
    }

    return await this.prisma.order.update({
      where: { id },
      data,
      include: {
        user: { select: ADMIN_ORDER_USER_SELECT },
        paymentMethod: true,
      },
    });
  }

  async cancel(id: string, dto: CancelAdminOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        error: id,
      });
    }

    if (
      order.deliveryStatus === OrderDeliveryStatus.DELIVERED ||
      order.deliveryStatus === OrderDeliveryStatus.RECEIVED
    ) {
      throw new BadRequestException({
        message:
          'Нельзя отменить заказ, который уже доставлен или получен покупателем',
        code: 'ORDER_ALREADY_DELIVERED',
      });
    }

    if (order.cancelReason) {
      throw new BadRequestException({
        message: 'Заказ уже был отменен ранее',
        code: 'ORDER_ALREADY_CANCELED',
        cancelReason: order.cancelReason,
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      // Возвращаем остатки на склад
      for (const item of order.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          cancelReason: dto.reason,
          uiStatus: OrderUIStatus.ARCHIVED,
          paymentStatus:
            order.paymentStatus === OrderPaymentStatus.PAID
              ? OrderPaymentStatus.REFUNDED
              : order.paymentStatus,
        },
        include: {
          user: { select: ADMIN_ORDER_USER_SELECT },
          items: true,
        },
      });

      return {
        success: true,
        message:
          'Заказ успешно отменен администратором, товары возвращены на склад',
        order: updated,
      };
    });
  }

  async exportReceipt(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: { title: true },
                },
              },
            },
          },
        },
        paymentMethod: true,
        address: true,
        user: {
          select: ADMIN_ORDER_USER_SELECT,
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
        error: id,
      });
    }

    const buffer = await this.pdfService.generate({
      template: new ReceiptTemplate(),
      data: order,
    });

    return { order, buffer };
  }
}
