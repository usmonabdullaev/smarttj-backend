import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { NotificationsService } from '@/modules/notifications/notifications.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('users')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async getAll(@GetUser('userId') userId: string) {
    return await this.notificationsService.getAll(userId);
  }
}
