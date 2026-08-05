import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AnalyzeResponseDto } from '@/modules/admin/ai/dto/analyze-response.dto';
import { AnalyzeRequestDto } from '@/modules/admin/ai/dto/analyze-request.dto';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
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
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  async analyze(@Body() dto: AnalyzeRequestDto) {
    return await this.adminAIService.analyze(dto);
  }
}
