import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderItemDeliveryStatus, PayoutStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreatePayoutRequestDto,
  FinanceSortOrder,
  GetPartnerOperationsDto,
  GetPartnerPayoutsDto,
  PartnerFinancesSummaryResponseDto,
  PartnerOperationItemDto,
  PartnerOperationsListResponseDto,
  PartnerPayoutsListResponseDto,
  PartnerRequisitesResponseDto,
  PayoutMethodType,
  PayoutOperationStatus,
  PayoutRequestItemDto,
  UpdatePartnerRequisitesDto,
} from './dto';

/**
 * Ограничение на частоту вывода средств (в днях).
 * Партнёр может создать только 1 активную/успешную заявку за этот период.
 * Если заявка была отменена (CANCELLED) или отклонена (REJECTED), можно подать снова.
 * Чтобы изменить интервал, просто измените число ниже (1 = раз в день, 7 = раз в неделю и т.д.).
 */
export const PAYOUT_REQUEST_LIMIT_DAYS: number = 1;

@Injectable()
export class PartnerFinancesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Сводка баланса партнера (доступно, холд, резерв в заявках, выплачено, заработано чистыми, комиссия),
   * месячная статистика и статус реквизитов.
   */
  async getSummary(
    partnerId: string,
  ): Promise<PartnerFinancesSummaryResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        inn: true,
        bankName: true,
        bankAccount: true,
        bik: true,
        cardAccount: true,
        cardHolder: true,
        cardBank: true,
        payoutPhone: true,
        commissionRate: true,
      },
    });

    if (!partner) {
      throw new NotFoundException('Профиль партнёра не найден');
    }

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    const [aggregates, payoutsReservedAgg, payoutsWithdrawnAgg] =
      await Promise.all([
        this.prisma.$queryRaw<
          {
            available_gross: number;
            pending: number;
            total_earned: number;
            total_commission: number;
            refunded: number;
            month_revenue: number;
            month_payout: number;
            month_orders: number;
            month_items_sold: number;
          }[]
        >(
          Prisma.sql`
            SELECT
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND oi."deliveryStatus"::text IN ('DELIVERED', 'RECEIVED') THEN (CASE WHEN oi."payoutAmount" > 0 THEN oi."payoutAmount" ELSE oi."price" * oi."quantity" END) ELSE 0 END), 0)::float AS available_gross,
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND oi."deliveryStatus"::text IN ('NEW', 'PROCESSING', 'SHIPPED', 'AT_PICKUP_POINT') THEN (CASE WHEN oi."payoutAmount" > 0 THEN oi."payoutAmount" ELSE oi."price" * oi."quantity" END) ELSE 0 END), 0)::float AS pending,
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND oi."deliveryStatus"::text NOT IN ('RETURNED', 'RETURN_PROCESS') THEN (CASE WHEN oi."payoutAmount" > 0 THEN oi."payoutAmount" ELSE oi."price" * oi."quantity" END) ELSE 0 END), 0)::float AS total_earned,
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND oi."deliveryStatus"::text NOT IN ('RETURNED', 'RETURN_PROCESS') THEN oi."commissionAmount" ELSE 0 END), 0)::float AS total_commission,
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND oi."deliveryStatus"::text IN ('RETURNED', 'RETURN_PROCESS') THEN oi."price" * oi."quantity" ELSE 0 END), 0)::float AS refunded,

              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${startOfMonth} THEN oi."price" * oi."quantity" ELSE 0 END), 0)::float AS month_revenue,
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${startOfMonth} THEN (CASE WHEN oi."payoutAmount" > 0 THEN oi."payoutAmount" ELSE oi."price" * oi."quantity" END) ELSE 0 END), 0)::float AS month_payout,
              COUNT(DISTINCT CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${startOfMonth} THEN oi."orderId" END)::int AS month_orders,
              COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${startOfMonth} THEN oi."quantity" ELSE 0 END), 0)::int AS month_items_sold
            FROM "OrderItem" oi
            JOIN "Order" o ON o.id = oi."orderId"
            LEFT JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
            LEFT JOIN "Product" p ON p.id = pv."productId"
            WHERE (oi."partnerId"::text = ${partnerId} OR p."partnerId"::text = ${partnerId})
          `,
        ),
        this.prisma.payoutRequest.aggregate({
          _sum: { amount: true },
          where: {
            partnerId,
            status: { in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING] },
          },
        }),
        this.prisma.payoutRequest.aggregate({
          _sum: { amount: true },
          where: {
            partnerId,
            status: PayoutStatus.COMPLETED,
          },
        }),
      ]);

    const agg = aggregates[0] ?? {
      available_gross: 0,
      pending: 0,
      total_earned: 0,
      total_commission: 0,
      refunded: 0,
      month_revenue: 0,
      month_payout: 0,
      month_orders: 0,
      month_items_sold: 0,
    };

    const reserved = Number(payoutsReservedAgg._sum.amount || 0);
    const withdrawn = Number(payoutsWithdrawnAgg._sum.amount || 0);
    const grossAvailable = Number(agg.available_gross);
    const netAvailable = Math.max(0, grossAvailable - reserved - withdrawn);

    const monthRevenue = Number(agg.month_revenue);
    const monthOrders = Number(agg.month_orders);
    const averageCheck =
      monthOrders > 0 ? Math.round(monthRevenue / monthOrders) : 0;

    // Определение статуса реквизитов
    const hasBank = Boolean(partner.bankAccount && partner.bik);
    const hasCard = Boolean(partner.cardAccount);
    const hasPhone = Boolean(partner.payoutPhone);
    const hasPayoutMethod = Boolean(hasBank || hasCard || hasPhone);
    const isComplete = Boolean(hasPayoutMethod && partner.inn);

    let payoutMethod = PayoutMethodType.NONE;
    if (hasBank) {
      payoutMethod = PayoutMethodType.BANK_ACCOUNT;
    } else if (hasCard || hasPhone) {
      payoutMethod = PayoutMethodType.CARD;
    }

    const missingFields: string[] = [];
    if (!partner.inn) missingFields.push('inn');
    if (!hasPayoutMethod) {
      missingFields.push('bankAccount, cardAccount или payoutPhone');
    }

    return {
      commissionRate: Number(partner.commissionRate || 5.0),
      balance: {
        available: netAvailable,
        pending: Number(agg.pending),
        reserved,
        withdrawn,
        totalEarned: Number(agg.total_earned),
        totalCommissionPaid: Number(agg.total_commission),
        refunded: Number(agg.refunded),
      },
      monthlyStats: {
        revenue: monthRevenue,
        payoutAmount: Number(agg.month_payout),
        ordersCount: monthOrders,
        itemsSold: Number(agg.month_items_sold),
        averageCheck,
      },
      requisitesStatus: {
        isComplete,
        payoutMethod,
        missingFields: missingFields.length > 0 ? missingFields : undefined,
      },
    };
  }

  /**
   * Подача заявки на вывод средств партнёром.
   */
  async withdraw(
    partnerId: string,
    dto: CreatePayoutRequestDto,
  ): Promise<PayoutRequestItemDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Профиль партнёра не найден');
    }

    const hasBank = Boolean(partner.bankAccount && partner.bik);
    const payoutMethod = hasBank ? 'BANK_ACCOUNT' : 'CARD';

    // Проверяем лимит: не более 1 успешной или активной заявки за заданный период (PAYOUT_REQUEST_LIMIT_DAYS)
    // Если заявка была отменена (CANCELLED) или отклонена (REJECTED), можно подавать новую
    const now = new Date();
    const cooldownSince = new Date(
      now.getTime() - PAYOUT_REQUEST_LIMIT_DAYS * 24 * 60 * 60 * 1000,
    );

    const recentPayout = await this.prisma.payoutRequest.findFirst({
      where: {
        partnerId,
        status: {
          in: [
            PayoutStatus.PENDING,
            PayoutStatus.PROCESSING,
            PayoutStatus.COMPLETED,
          ],
        },
        createdAt: { gte: cooldownSince },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentPayout) {
      if (
        recentPayout.status === PayoutStatus.PENDING ||
        recentPayout.status === PayoutStatus.PROCESSING
      ) {
        throw new BadRequestException(
          'У вас уже есть активная заявка на вывод в обработке. Дождитесь её завершения или отмените её.',
        );
      }

      const periodText =
        PAYOUT_REQUEST_LIMIT_DAYS === 1
          ? 'в день'
          : `раз в ${PAYOUT_REQUEST_LIMIT_DAYS} дн.`;

      throw new BadRequestException(
        `Вы можете подавать не более 1 заявки на вывод ${periodText}. Пожалуйста, повторите попытку позже.`,
      );
    }

    // Проверяем доступный баланс
    const summary = await this.getSummary(partnerId);
    if (dto.amount > summary.balance.available) {
      throw new BadRequestException(
        `Недостаточно средств для вывода. Доступно к выводу: ${summary.balance.available} сомони`,
      );
    }

    const requisitesSnapshot = {
      inn: partner.inn,
      bankName: partner.bankName,
      bankAccount: partner.bankAccount,
      bik: partner.bik,
      cardAccount: partner.cardAccount,
      cardHolder: partner.cardHolder,
      cardBank: partner.cardBank,
      payoutPhone: partner.payoutPhone,
      alifTerminalId: partner.alifTerminalId,
    };

    const payout = await this.prisma.payoutRequest.create({
      data: {
        partnerId,
        amount: dto.amount,
        status: PayoutStatus.PENDING,
        payoutMethod,
        requisitesSnapshot,
        comment: dto.comment ? dto.comment.trim() : null,
      },
    });

    return {
      id: payout.id,
      amount: payout.amount,
      status: payout.status,
      payoutMethod: payout.payoutMethod,
      requisitesSnapshot: payout.requisitesSnapshot as Record<string, any>,
      comment: payout.comment,
      rejectReason: payout.rejectReason,
      transactionReference: payout.transactionReference,
      processedAt: payout.processedAt,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    };
  }

  /**
   * Получение истории заявок на вывод средств данного партнёра.
   */
  async getPayouts(
    partnerId: string,
    query: GetPartnerPayoutsDto,
  ): Promise<PartnerPayoutsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutRequestWhereInput = {
      partnerId,
      ...(query.status && { status: query.status }),
    };

    const [total, items] = await Promise.all([
      this.prisma.payoutRequest.count({ where }),
      this.prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        payoutMethod: p.payoutMethod,
        requisitesSnapshot: p.requisitesSnapshot as Record<string, any>,
        comment: p.comment,
        rejectReason: p.rejectReason,
        transactionReference: p.transactionReference,
        processedAt: p.processedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  /**
   * Отмена заявки на вывод партнёром (только в статусе PENDING).
   */
  async cancelPayout(
    partnerId: string,
    payoutId: string,
  ): Promise<PayoutRequestItemDto> {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout || payout.partnerId !== partnerId) {
      throw new NotFoundException('Заявка на вывод средств не найдена');
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(
        'Отменить можно только заявку, находящуюся в статусе ожидания (PENDING)',
      );
    }

    const updated = await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.CANCELLED,
      },
    });

    return {
      id: updated.id,
      amount: updated.amount,
      status: updated.status,
      payoutMethod: updated.payoutMethod,
      requisitesSnapshot: updated.requisitesSnapshot as Record<string, any>,
      comment: updated.comment,
      rejectReason: updated.rejectReason,
      transactionReference: updated.transactionReference,
      processedAt: updated.processedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Получение платежных реквизитов партнера.
   */
  async getRequisites(
    partnerId: string,
  ): Promise<PartnerRequisitesResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      select: {
        inn: true,
        bankName: true,
        bankAccount: true,
        bik: true,
        cardAccount: true,
        cardHolder: true,
        cardBank: true,
        payoutPhone: true,
        alifTerminalId: true,
      },
    });

    if (!partner) {
      throw new NotFoundException('Профиль партнёра не найден');
    }

    const hasBank = Boolean(partner.bankAccount && partner.bik);
    const hasCard = Boolean(partner.cardAccount);
    const hasPhone = Boolean(partner.payoutPhone);
    const isComplete = Boolean((hasBank || hasCard || hasPhone) && partner.inn);

    return {
      inn: partner.inn,
      bankName: partner.bankName,
      bankAccount: partner.bankAccount,
      bik: partner.bik,
      cardAccount: partner.cardAccount,
      cardHolder: partner.cardHolder,
      cardBank: partner.cardBank,
      payoutPhone: partner.payoutPhone,
      alifTerminalId: partner.alifTerminalId,
      isComplete,
    };
  }

  /**
   * Обновление платежных реквизитов партнера.
   */
  async updateRequisites(
    partnerId: string,
    dto: UpdatePartnerRequisitesDto,
  ): Promise<PartnerRequisitesResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Профиль партнёра не найден');
    }

    const updated = await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        ...(dto.inn !== undefined && {
          inn: dto.inn ? dto.inn.trim() : null,
        }),
        ...(dto.bankName !== undefined && {
          bankName: dto.bankName ? dto.bankName.trim() : null,
        }),
        ...(dto.bankAccount !== undefined && {
          bankAccount: dto.bankAccount ? dto.bankAccount.trim() : null,
        }),
        ...(dto.bik !== undefined && {
          bik: dto.bik ? dto.bik.trim() : null,
        }),
        ...(dto.cardAccount !== undefined && {
          cardAccount: dto.cardAccount ? dto.cardAccount.trim() : null,
        }),
        ...(dto.cardHolder !== undefined && {
          cardHolder: dto.cardHolder ? dto.cardHolder.trim() : null,
        }),
        ...(dto.cardBank !== undefined && {
          cardBank: dto.cardBank ? dto.cardBank.trim() : null,
        }),
        ...(dto.payoutPhone !== undefined && {
          payoutPhone: dto.payoutPhone ? dto.payoutPhone.trim() : null,
        }),
        ...(dto.alifTerminalId !== undefined && {
          alifTerminalId: dto.alifTerminalId ? dto.alifTerminalId.trim() : null,
        }),
      },
      select: {
        inn: true,
        bankName: true,
        bankAccount: true,
        bik: true,
        cardAccount: true,
        cardHolder: true,
        cardBank: true,
        payoutPhone: true,
        alifTerminalId: true,
      },
    });

    const hasBank = Boolean(updated.bankAccount && updated.bik);
    const hasCard = Boolean(updated.cardAccount);
    const hasPhone = Boolean(updated.payoutPhone);
    const isComplete = Boolean((hasBank || hasCard || hasPhone) && updated.inn);

    return {
      inn: updated.inn,
      bankName: updated.bankName,
      bankAccount: updated.bankAccount,
      bik: updated.bik,
      cardAccount: updated.cardAccount,
      cardHolder: updated.cardHolder,
      cardBank: updated.cardBank,
      payoutPhone: updated.payoutPhone,
      alifTerminalId: updated.alifTerminalId,
      isComplete,
    };
  }

  /**
   * Журнал финансовых операций и начислений по позициям заказов с учетом комиссии.
   */
  async getOperations(
    partnerId: string,
    query: GetPartnerOperationsDto,
  ): Promise<PartnerOperationsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const orderWhere: Prisma.OrderWhereInput = {
      paymentStatus: 'PAID',
    };

    if (query.from || query.to) {
      orderWhere.createdAt = {
        gte: query.from,
        lte: query.to,
      };
    }

    const where: Prisma.OrderItemWhereInput = {
      order: orderWhere,
      OR: [
        { partnerId },
        {
          productVariant: {
            product: {
              partnerId,
            },
          },
        },
      ],
    };

    if (query.status && query.status !== PayoutOperationStatus.ALL) {
      if (query.status === PayoutOperationStatus.AVAILABLE) {
        where.deliveryStatus = {
          in: [
            OrderItemDeliveryStatus.DELIVERED,
            OrderItemDeliveryStatus.RECEIVED,
          ],
        };
      } else if (query.status === PayoutOperationStatus.HOLD) {
        where.deliveryStatus = {
          in: [
            OrderItemDeliveryStatus.NEW,
            OrderItemDeliveryStatus.PROCESSING,
            OrderItemDeliveryStatus.SHIPPED,
            OrderItemDeliveryStatus.AT_PICKUP_POINT,
          ],
        };
      } else if (query.status === PayoutOperationStatus.REFUNDED) {
        where.deliveryStatus = {
          in: [
            OrderItemDeliveryStatus.RETURNED,
            OrderItemDeliveryStatus.RETURN_PROCESS,
          ],
        };
      }
    }

    if (query.q && query.q.trim()) {
      const search = query.q.trim();
      where.AND = [
        {
          OR: [
            { productTitle: { contains: search, mode: 'insensitive' } },
            { productSku: { contains: search, mode: 'insensitive' } },
            { orderId: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const sortDirection =
      query.sortOrder === FinanceSortOrder.ASC ? 'asc' : 'desc';

    const [total, orderItems] = await Promise.all([
      this.prisma.orderItem.count({ where }),
      this.prisma.orderItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          order: {
            createdAt: sortDirection,
          },
        },
        include: {
          order: {
            select: {
              id: true,
              createdAt: true,
              paidAt: true,
            },
          },
        },
      }),
    ]);

    const items: PartnerOperationItemDto[] = orderItems.map((oi) => {
      let payoutStatus: PayoutOperationStatus = PayoutOperationStatus.HOLD;
      if (
        oi.deliveryStatus === OrderItemDeliveryStatus.DELIVERED ||
        oi.deliveryStatus === OrderItemDeliveryStatus.RECEIVED
      ) {
        payoutStatus = PayoutOperationStatus.AVAILABLE;
      } else if (
        oi.deliveryStatus === OrderItemDeliveryStatus.RETURNED ||
        oi.deliveryStatus === OrderItemDeliveryStatus.RETURN_PROCESS
      ) {
        payoutStatus = PayoutOperationStatus.REFUNDED;
      }

      const totalAmount = oi.price * oi.quantity;
      const commissionAmount = oi.commissionAmount || 0;
      const payoutAmount =
        oi.payoutAmount > 0 ? oi.payoutAmount : totalAmount - commissionAmount;

      return {
        id: oi.id,
        orderId: oi.orderId,
        orderCreatedAt: oi.order.createdAt,
        orderPaidAt: oi.order.paidAt,
        productTitle: oi.productTitle || 'Товар',
        productSku: oi.productSku,
        quantity: oi.quantity,
        unitPrice: oi.price,
        totalAmount,
        commissionRate: oi.commissionRate || 0,
        commissionAmount,
        payoutAmount,
        deliveryStatus: oi.deliveryStatus,
        payoutStatus,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }
}
