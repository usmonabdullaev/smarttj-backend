import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatisticsService } from './statistics.service';
import { StatisticsResponseDto } from './dto/statistics-response.dto';

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
