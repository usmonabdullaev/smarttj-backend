import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import {
  GetSalesChartDto,
  GetTopProductsDto,
  PartnerCardsResponseDto,
  PartnerTopProductItemDto,
} from './dto';
import { PartnerStatisticsService } from './statistics.service';

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
      'Выручка (всего, за месяц, сегодня, динамика к прошлому месяцу, средний чек), ' +
      'Заказы (всего, за месяц, сегодня, в обработке, динамика), ' +
      'Товары (всего, активные, на модерации, черновики)',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистические карточки магазина партнера',
    type: PartnerCardsResponseDto,
  })
  async cards(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerStatisticsService.cards(profile.id);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Топ продаваемых товаров партнера',
    description:
      'Рейтинг товаров по количеству продаж и выручке за указанный период (7d, 1m, 3m, all) с остатками и рейтингом',
  })
  @ApiResponse({
    status: 200,
    description: 'Список топовых товаров партнера',
    type: [PartnerTopProductItemDto],
  })
  async topProducts(
    @GetUser('sessionId') sessionId: string,
    @Query() dto: GetTopProductsDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerStatisticsService.topProducts(profile.id, dto);
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
