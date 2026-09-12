import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { AdminStatisticsResponseDto, GetAdminStatisticsQueryDto } from './dto';
import { AdminStatisticsService } from './statistics.service';

@ApiTags('Admin - Статистика')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('statistics')
export class AdminStatisticsController {
  constructor(
    private readonly adminStatisticsService: AdminStatisticsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить статистику и данные для диаграмм дашборда администратора',
    description:
      'Возвращает KPI карточки (выручка, заказы, средний чек, пользователи, партнеры, товары), данные тренда (Area Chart), тепловую карту активности заказов (Heatmap 7x24), распределение по категориям (Donut Chart), топ товаров и партнеров, и статусы заказов.',
  })
  @ApiOkResponse({
    type: AdminStatisticsResponseDto,
    description: 'Полная статистика дашборда',
  })
  async getDashboard(@Query() query: GetAdminStatisticsQueryDto) {
    return await this.adminStatisticsService.getDashboard(query);
  }
}
