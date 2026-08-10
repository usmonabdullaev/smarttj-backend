import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AnalyzeResponseDto } from '@/modules/admin/ai/dto/responses/analyze.response';
import { AnalyzeRequestDto } from '@/modules/admin/ai/dto/requests/analyze.request';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('ai')
export class AdminAIController {
  constructor(private readonly adminAIService: AdminAIService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'AI Analysis' })
  @ApiOkResponse({ type: AnalyzeResponseDto })
  async analyze(@Body() dto: AnalyzeRequestDto): Promise<AnalyzeResponseDto> {
    return await this.adminAIService.analyze(dto);
  }
}
