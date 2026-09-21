import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PartnerStatus, UserRole } from '@prisma/client';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '@/database/prisma/prisma.service';
import { ValidateRequest } from '@/auth/strategies/dto/requests/validate.request';
import {
  ALLOW_BLOCKED_PARTNER_KEY,
  REQUIRE_PARTNER_STATUS_KEY,
} from '@/common/decorators/partner-status.decorator';

@Injectable()
export class PartnerStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as ValidateRequest | undefined;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        error: null,
      });
    }

    if (user.role !== UserRole.PARTNER) {
      return true;
    }

    const partner = await this.prisma.partner.findUnique({
      where: { userId: user.userId },
    });

    if (!partner) {
      throw new ForbiddenException({
        message: 'Профиль партнёра не найден',
        code: 'PARTNER_NOT_FOUND',
        error: null,
      });
    }

    request.partner = partner;

    // 1. Проверка для BLOCKED (доступ только к auth и notifications через @AllowBlockedPartner)
    if (partner.status === PartnerStatus.BLOCKED) {
      const isBlockedAllowed = this.reflector.getAllAndOverride<boolean>(
        ALLOW_BLOCKED_PARTNER_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!isBlockedAllowed) {
        throw new ForbiddenException({
          message: 'Ваш аккаунт партнёра заблокирован',
          code: 'PARTNER_BLOCKED',
          error: { status: partner.status },
        });
      }

      return true;
    }

    // 2. Проверка явно указанных необходимых статусов
    const requiredStatuses = this.reflector.getAllAndOverride<PartnerStatus[]>(
      REQUIRE_PARTNER_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredStatuses && requiredStatuses.length > 0) {
      if (!requiredStatuses.includes(partner.status)) {
        if (partner.status === PartnerStatus.IN_MODERATE) {
          throw new ForbiddenException({
            message:
              'Создание и обновление товаров недоступно: ваш аккаунт находится на модерации',
            code: 'PARTNER_IN_MODERATION',
            error: { requiredStatuses, currentStatus: partner.status },
          });
        }

        throw new ForbiddenException({
          message: 'Доступ ограничен текущим статусом партнёра',
          code: 'PARTNER_STATUS_FORBIDDEN',
          error: { requiredStatuses, currentStatus: partner.status },
        });
      }
    }

    return true;
  }
}
