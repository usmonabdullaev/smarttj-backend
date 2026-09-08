import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApplicationResponse, GetListRequest, UpdateRequest } from './dto';
import { AdminApplicationsService } from './applications.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('applications')
export class AdminApplicationsController {
  constructor(private readonly service: AdminApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get applications list' })
  @ApiOkResponse({ type: ApplicationResponse, isArray: true })
  async getList(@Query() query: GetListRequest) {
    return await this.service.getList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiOkResponse({ type: ApplicationResponse })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiOkResponse({ type: ApplicationResponse })
  async update(@Param('id') id: string, @Body() dto: UpdateRequest) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  @ApiOkResponse({ type: ApplicationResponse })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
