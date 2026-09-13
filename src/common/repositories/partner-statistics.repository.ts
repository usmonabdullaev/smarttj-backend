import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class PartnerStatisticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Количество товаров по статусу (или всех) для данного партнёра */
  countProducts(partnerId: string, status?: ProductStatus | ProductStatus[]) {
    const statusFilter: Prisma.ProductWhereInput['status'] = status
      ? Array.isArray(status)
        ? { in: status }
        : status
      : undefined;

    return this.prisma.product.count({
      where: {
        partnerId,
        status: statusFilter,
      },
    });
  }

  /** Суммарная выручка партнёра за период (только оплаченные) */
  async sumRevenue(partnerId: string, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.$queryRaw<{ total: number }[]>(
      Prisma.sql`
        SELECT COALESCE(SUM("oi"."price" * "oi"."quantity"), 0)::float AS total
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        LEFT JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        LEFT JOIN "Product" p ON p.id = pv."productId"
        WHERE
          (oi."partnerId"::text = ${partnerId} OR p."partnerId"::text = ${partnerId})
          AND o."createdAt" >= ${from}
          AND o."createdAt" <= ${to}
          AND o."paymentStatus"::text = 'PAID'
      `,
    );
    return result[0]?.total ?? 0;
  }

  /** Количество проданных единиц за период (только оплаченные) */
  async sumSoldCount(partnerId: string, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.$queryRaw<{ total: number }[]>(
      Prisma.sql`
        SELECT COALESCE(SUM("oi"."quantity"), 0)::int AS total
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        LEFT JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        LEFT JOIN "Product" p ON p.id = pv."productId"
        WHERE
          (oi."partnerId"::text = ${partnerId} OR p."partnerId"::text = ${partnerId})
          AND o."createdAt" >= ${from}
          AND o."createdAt" <= ${to}
          AND o."paymentStatus"::text = 'PAID'
      `,
    );
    return result[0]?.total ?? 0;
  }

  /**
   * Ежедневная продажа товаров партнёра за период (только оплаченные).
   */
  async dailySales(
    partnerId: string,
    from: Date,
    to: Date,
  ): Promise<{ date: string; revenue: number; sold: number }[]> {
    return this.prisma.$queryRaw<
      { date: string; revenue: number; sold: number }[]
    >(
      Prisma.sql`
        SELECT
          DATE("o"."createdAt")::text                              AS date,
          COALESCE(SUM("oi"."price" * "oi"."quantity"), 0)::float AS revenue,
          COALESCE(SUM("oi"."quantity"), 0)::int                  AS sold
        FROM "OrderItem" oi
        JOIN "Order"          o  ON o.id  = oi."orderId"
        LEFT JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        LEFT JOIN "Product"        p  ON p.id  = pv."productId"
        WHERE
          (oi."partnerId"::text = ${partnerId} OR p."partnerId"::text = ${partnerId})
          AND o."createdAt" >= ${from}
          AND o."createdAt" <= ${to}
          AND o."paymentStatus"::text = 'PAID'
        GROUP BY DATE("o"."createdAt")
        ORDER BY DATE("o"."createdAt") ASC
      `,
    );
  }

  /**
   * Сводка выручки и заказов партнера (всего, сегодня, этот месяц, прошлый месяц, в обработке).
   */
  async getFinancialAndOrdersSummary(
    partnerId: string,
    dates: {
      startOfToday: Date;
      endOfToday: Date;
      startOfThisMonth: Date;
      endOfThisMonth: Date;
      startOfPrevMonth: Date;
      endOfPrevMonth: Date;
    },
  ) {
    const result = await this.prisma.$queryRaw<
      {
        total_revenue: number;
        today_revenue: number;
        month_revenue: number;
        prev_month_revenue: number;
        total_orders: number;
        today_orders: number;
        month_orders: number;
        prev_month_orders: number;
        pending_orders: number;
      }[]
    >(
      Prisma.sql`
        SELECT
          COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' THEN oi."price" * oi."quantity" ELSE 0 END), 0)::float AS total_revenue,
          COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${dates.startOfToday} AND o."createdAt" <= ${dates.endOfToday} THEN oi."price" * oi."quantity" ELSE 0 END), 0)::float AS today_revenue,
          COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${dates.startOfThisMonth} AND o."createdAt" <= ${dates.endOfThisMonth} THEN oi."price" * oi."quantity" ELSE 0 END), 0)::float AS month_revenue,
          COALESCE(SUM(CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${dates.startOfPrevMonth} AND o."createdAt" <= ${dates.endOfPrevMonth} THEN oi."price" * oi."quantity" ELSE 0 END), 0)::float AS prev_month_revenue,

          COUNT(DISTINCT CASE WHEN o."paymentStatus"::text = 'PAID' THEN oi."orderId" END)::int AS total_orders,
          COUNT(DISTINCT CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${dates.startOfToday} AND o."createdAt" <= ${dates.endOfToday} THEN oi."orderId" END)::int AS today_orders,
          COUNT(DISTINCT CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${dates.startOfThisMonth} AND o."createdAt" <= ${dates.endOfThisMonth} THEN oi."orderId" END)::int AS month_orders,
          COUNT(DISTINCT CASE WHEN o."paymentStatus"::text = 'PAID' AND o."createdAt" >= ${dates.startOfPrevMonth} AND o."createdAt" <= ${dates.endOfPrevMonth} THEN oi."orderId" END)::int AS prev_month_orders,
          COUNT(DISTINCT CASE WHEN o."paymentStatus"::text = 'PAID' AND oi."deliveryStatus"::text IN ('NEW', 'PROCESSING', 'SHIPPED', 'AT_PICKUP_POINT') THEN oi."orderId" END)::int AS pending_orders
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        LEFT JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        LEFT JOIN "Product" p ON p.id = pv."productId"
        WHERE (oi."partnerId"::text = ${partnerId} OR p."partnerId"::text = ${partnerId})
      `,
    );

    return (
      result[0] ?? {
        total_revenue: 0,
        today_revenue: 0,
        month_revenue: 0,
        prev_month_revenue: 0,
        total_orders: 0,
        today_orders: 0,
        month_orders: 0,
        prev_month_orders: 0,
        pending_orders: 0,
      }
    );
  }

  /**
   * Топ продаваемых товаров партнера за период.
   */
  async getTopProducts(
    partnerId: string,
    limit: number = 5,
    from?: Date,
    to?: Date,
  ): Promise<
    {
      id: string;
      title: string | null;
      slug: string | null;
      averageRating: number;
      category_id: string | null;
      category_name: string | null;
      sold_count: number;
      revenue: number;
      orders_count: number;
      current_stock: number;
      image_url: string | null;
    }[]
  > {
    return this.prisma.$queryRaw`
      SELECT
        p.id,
        p.title,
        p.slug,
        p."averageRating"::float AS "averageRating",
        c.id AS category_id,
        c.name AS category_name,
        COALESCE(SUM(oi.quantity), 0)::int AS sold_count,
        COALESCE(SUM(oi.price * oi.quantity), 0)::float AS revenue,
        COUNT(DISTINCT oi."orderId")::int AS orders_count,
        COALESCE(stock_calc.total_stock, 0)::int AS current_stock,
        (
          SELECT img.url
          FROM "Image" img
          JOIN "ProductVariant" pv_img ON pv_img.id = img."productVariantId"
          WHERE pv_img."productId" = p.id
          ORDER BY img."order" ASC
          LIMIT 1
        ) AS image_url
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      LEFT JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
      LEFT JOIN "Product" p ON p.id = pv."productId"
      LEFT JOIN "Category" c ON c.id = p."categoryId"
      LEFT JOIN (
        SELECT "productId", SUM(stock) AS total_stock
        FROM "ProductVariant"
        GROUP BY "productId"
      ) stock_calc ON stock_calc."productId" = p.id
      WHERE
        (oi."partnerId"::text = ${partnerId} OR p."partnerId"::text = ${partnerId})
        AND p.id IS NOT NULL
        AND p."deletedAt" IS NULL
        AND o."paymentStatus"::text = 'PAID'
        ${from ? Prisma.sql`AND o."createdAt" >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND o."createdAt" <= ${to}` : Prisma.empty}
      GROUP BY p.id, p.title, p.slug, p."averageRating", c.id, c.name, stock_calc.total_stock
      ORDER BY sold_count DESC, revenue DESC
      LIMIT ${limit}
    `;
  }
}
