import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { AdminUsersService } from '@/modules/admin/users/users.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetAllRequest } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Users list (role=USER)' })
  async getAll(@Query() query: GetAllRequest) {
    return await this.service.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user (role=USER)' })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }
}
