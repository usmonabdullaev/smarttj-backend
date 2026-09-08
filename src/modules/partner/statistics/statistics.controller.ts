import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { PartnerStatisticsService } from './statistics.service';
import { GetSalesChartDto } from './dto/get-sales-chart.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Statistics')
@Controller('statistics')
export class PartnerStatisticsController {
  constructor(
    private readonly partnerStatisticsService: PartnerStatisticsService,
    private readonly partnerAuthService: PartnerAuthService,
  ) {}

  @Get('cards')
  @ApiOperation({
    summary: 'Числовые карточки главной страницы',
    description:
      'Всего товаров / Активные в каталоге / На модерации / Черновики',
  })
  async cards(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerStatisticsService.cards(profile.id);
  }

  @Get('sales-chart')
  @ApiOperation({
    summary: 'Данные для Area Chart продаж',
    description: 'Фильтры: 7d (7 дней), 1m (1 месяц), 3m (3 месяца)',
  })
  async salesChart(
    @GetUser('sessionId') sessionId: string,
    @Query() dto: GetSalesChartDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerStatisticsService.salesChart(profile.id, dto);
  }
}
