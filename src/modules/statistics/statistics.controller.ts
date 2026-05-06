import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';

import { StatisticsResponseDto } from '@/modules/statistics/dto/statistics-response.dto';
import { StatisticsService } from '@/modules/statistics/statistics.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get statistics' })
  @ApiOkResponse({ type: StatisticsResponseDto })
  async cards() {
    return await this.statisticsService.cards();
  }
}
