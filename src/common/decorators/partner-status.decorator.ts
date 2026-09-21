import { SetMetadata } from '@nestjs/common';
import { PartnerStatus } from '@prisma/client';

export const REQUIRE_PARTNER_STATUS_KEY = 'require_partner_status';
export const ALLOW_BLOCKED_PARTNER_KEY = 'allow_blocked_partner';

/**
 * Ограничивает доступ к методу или контроллеру определёнными статусами партнёра.
 * Например: @RequirePartnerStatus(PartnerStatus.ACTIVE)
 */
export const RequirePartnerStatus = (...statuses: PartnerStatus[]) =>
  SetMetadata(REQUIRE_PARTNER_STATUS_KEY, statuses);

/**
 * Разрешает доступ к методу или контроллеру партнёрам со статусом BLOCKED.
 * По умолчанию используется для auth и notifications.
 */
export const AllowBlockedPartner = () =>
  SetMetadata(ALLOW_BLOCKED_PARTNER_KEY, true);
