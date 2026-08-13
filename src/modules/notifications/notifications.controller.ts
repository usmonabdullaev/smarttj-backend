import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { NotificationsService } from '@/modules/notifications/notifications.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { GetAllResponse, GetOneResponse } from './dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiOkResponse({ type: GetAllResponse, isArray: true })
  async getAll(@GetUser('userId') userId: string) {
    return await this.notificationsService.getAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Gen notification detail' })
  @ApiOkResponse({ type: GetOneResponse })
  async getById(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.notificationsService.getById(id, userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Read all notifications' })
  @ApiOkResponse({ type: GetAllResponse, isArray: true })
  async readAll(@GetUser('userId') userId: string) {
    return await this.notificationsService.readAll(userId);
  }
}
