import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyzeResponseDto } from './dto/analyze-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';
import { ApiErrorDto } from '../../common/dto/api-error.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/ai/analyze')
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({ type: AnalyzeResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  async analyze(@Body() dto: AnalyzeRequestDto) {
    return await this.adminService.analyze(dto);
  }
}
