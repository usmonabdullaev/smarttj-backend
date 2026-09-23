import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PayoutStatus, Prisma } from '@prisma/client';
import { Response } from 'express';
import { Readable } from 'stream';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  AdminPayoutItemDto,
  AdminPayoutSortOrder,
  AdminPayoutsListResponseDto,
  AdminUpdatablePayoutStatus,
  GetAdminPayoutsDto,
  UpdatePayoutStatusDto,
} from './dto';

@Injectable()
export class AdminPayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Список всех заявок на вывод средств для администратора с фильтрами и поиском.
   */
  async getList(
    query: GetAdminPayoutsDto,
  ): Promise<AdminPayoutsListResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutRequestWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.partnerId) {
      where.partnerId = query.partnerId;
    }

    if (query.from || query.to) {
      where.createdAt = {
        gte: query.from,
        lte: query.to,
      };
    }

    if (query.q && query.q.trim()) {
      const search = query.q.trim();
      where.OR = [
        { partner: { title: { contains: search, mode: 'insensitive' } } },
        { partner: { inn: { contains: search, mode: 'insensitive' } } },
        { comment: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const sortDirection =
      query.sortOrder === AdminPayoutSortOrder.ASC ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      this.prisma.payoutRequest.count({ where }),
      this.prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortDirection },
        include: {
          partner: {
            select: {
              id: true,
              title: true,
              inn: true,
              phone1: true,
              commissionRate: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((p) => this.mapPayout(p)),
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
   * Детальный просмотр заявки на вывод.
   */
  async getById(id: string): Promise<AdminPayoutItemDto> {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            title: true,
            inn: true,
            phone1: true,
            commissionRate: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Заявка на выплату не найдена');
    }

    return this.mapPayout(payout);
  }

  /**
   * Обновление статуса заявки администратором (PROCESSING, COMPLETED, REJECTED).
   */
  async updateStatus(
    id: string,
    adminUserId: string,
    dto: UpdatePayoutStatusDto,
    file?: Express.Multer.File,
  ): Promise<AdminPayoutItemDto> {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id },
    });

    if (!payout) {
      throw new NotFoundException('Заявка на выплату не найдена');
    }

    if (
      payout.status === PayoutStatus.COMPLETED ||
      payout.status === PayoutStatus.REJECTED ||
      payout.status === PayoutStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Заявка уже находится в финальном статусе ${payout.status} и не может быть изменена`,
      );
    }

    if (dto.status === AdminUpdatablePayoutStatus.COMPLETED) {
      if (!file && !payout.checkUrl) {
        throw new BadRequestException(
          'Для подтверждения выплаты (COMPLETED) необходимо прикрепить файл чека (картинка или PDF)',
        );
      }
    }

    if (
      dto.status === AdminUpdatablePayoutStatus.REJECTED &&
      !dto.rejectReason?.trim()
    ) {
      throw new BadRequestException(
        'Для отклонения заявки (REJECTED) необходимо обязательно указать причину отказа (rejectReason)',
      );
    }

    let checkUrl = payout.checkUrl;
    let checkUrlId = payout.checkUrlId;

    if (file) {
      if (payout.checkUrlId) {
        await this.cloudinaryService
          .deleteFile(payout.checkUrlId)
          .catch(() => null);
      }

      const uploadResult = await this.cloudinaryService.uploadFile({
        file,
        folder: 'smarttj/payouts/checks',
      });

      if (!uploadResult?.secure_url) {
        throw new BadRequestException(
          'Не удалось загрузить файл чека в Cloudinary',
        );
      }

      checkUrl = uploadResult.secure_url;
      checkUrlId = uploadResult.public_id;
    }

    const updated = await this.prisma.payoutRequest.update({
      where: { id },
      data: {
        status: dto.status,
        checkUrl,
        checkUrlId,
        rejectReason: dto.rejectReason
          ? dto.rejectReason.trim()
          : payout.rejectReason,
        processedById: adminUserId,
        processedAt: new Date(),
      },
      include: {
        partner: {
          select: {
            id: true,
            title: true,
            inn: true,
            phone1: true,
            commissionRate: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapPayout(updated);
  }

  /**
   * Скачать файл чека выплаты администратором.
   */
  async downloadCheck(id: string, res: Response) {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id },
      select: { id: true, checkUrl: true },
    });

    if (!payout || !payout.checkUrl) {
      throw new NotFoundException(
        'Чек к данной заявке на выплату не прикреплён',
      );
    }

    try {
      const response = await fetch(payout.checkUrl);
      if (!response.ok) {
        throw new BadRequestException(
          'Не удалось скачать файл чека из хранилища',
        );
      }

      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      let ext = 'bin';
      if (contentType.includes('pdf')) ext = 'pdf';
      else if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';
      else if (contentType.includes('jpeg') || contentType.includes('jpg'))
        ext = 'jpg';

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="check_${payout.id}.${ext}"`,
      );

      const nodeStream = Readable.fromWeb(response.body as any);
      nodeStream.pipe(res);
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new BadRequestException(
        `Ошибка при скачивании файла: ${err.message}`,
      );
    }
  }

  private mapPayout(p: any): AdminPayoutItemDto {
    return {
      id: p.id,
      partnerId: p.partnerId,
      amount: p.amount,
      status: p.status,
      payoutMethod: p.payoutMethod,
      requisitesSnapshot: p.requisitesSnapshot as Record<string, any>,
      comment: p.comment,
      rejectReason: p.rejectReason,
      checkUrl: p.checkUrl,
      checkUrlId: p.checkUrlId,
      processedAt: p.processedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      partner: {
        id: p.partner.id,
        title: p.partner.title,
        inn: p.partner.inn,
        phone1: p.partner.phone1,
        commissionRate: Number(p.partner.commissionRate || 5.0),
      },
      processedBy: p.processedBy
        ? {
            id: p.processedBy.id,
            name: p.processedBy.name,
          }
        : null,
    };
  }
}
