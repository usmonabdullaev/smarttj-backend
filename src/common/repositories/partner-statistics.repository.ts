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
}
