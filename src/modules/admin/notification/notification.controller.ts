import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminNotificationService } from '@/modules/admin/notification/notification.service';
import { SendNotificationDto } from '@/modules/admin/notification/dto/send-notification.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('notification')
export class AdminNotificationController {
  constructor(
    private readonly adminNotificationService: AdminNotificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async getAll(@Body() dto: SendNotificationDto) {
    return await this.adminNotificationService.sendNotification(dto);
  }
}
