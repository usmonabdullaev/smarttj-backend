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

  /** Суммарная выручка партнёра за период */
  sumRevenue(partnerId: string, from: Date, to: Date) {
    return this.prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        order: { createdAt: { gte: from, lte: to } },
        productVariant: { product: { partnerId } },
      },
    });
  }

  /** Количество проданных единиц за период */
  sumSoldCount(partnerId: string, from: Date, to: Date) {
    return this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: { createdAt: { gte: from, lte: to } },
        productVariant: { product: { partnerId } },
      },
    });
  }

  /**
   * Ежедневная продажа товаров партнёра за период.
   *
   * Важно: pg-адаптер Prisma передаёт JS-строки как PostgreSQL тип text.
   * Сравнение uuid_column = text не поддерживается PostgreSQL без явного каста.
   * Решение: кастуем колонку uuid → text (p."partnerId"::text = $1),
   * тогда оба операнда text = text — работает всегда.
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
        JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        JOIN "Product"        p  ON p.id  = pv."productId"
        WHERE
          p."partnerId"::text = ${partnerId}
          AND o."createdAt" >= ${from}
          AND o."createdAt" <= ${to}
        GROUP BY DATE("o"."createdAt")
        ORDER BY DATE("o"."createdAt") ASC
      `,
    );
  }
}
