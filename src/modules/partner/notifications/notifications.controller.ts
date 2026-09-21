import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard, RolesGuard, PartnerStatusGuard } from '@/auth/guards';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AllowBlockedPartner } from '@/common/decorators/partner-status.decorator';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { GetAllResponse, GetOneResponse } from '@/modules/notifications/dto';

@UseGuards(JwtAuthGuard, RolesGuard, PartnerStatusGuard)
@Roles(UserRole.PARTNER)
@AllowBlockedPartner()
@ApiBearerAuth()
@ApiTags('Partner / Notifications')
@Controller('notifications')
export class PartnerNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить уведомления партнёра' })
  @ApiOkResponse({ type: GetAllResponse, isArray: true })
  async getAll(@GetUser('userId') userId: string) {
    return await this.notificationsService.getAll(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Получить количество непрочитанных уведомлений' })
  async getUnreadCount(@GetUser('userId') userId: string) {
    return await this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детальную информацию об уведомлении' })
  @ApiOkResponse({ type: GetOneResponse })
  async getById(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.notificationsService.getById(id, userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Отметить одно уведомление как прочитанное' })
  async markAsRead(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.notificationsService.markAsRead(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Отметить одно уведомление как прочитанное (алиас)',
  })
  async markAsReadAlias(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.notificationsService.markAsRead(id, userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  async readAll(@GetUser('userId') userId: string) {
    return await this.notificationsService.readAll(userId);
  }
}
