import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsersService } from '@/modules/admin/users/users.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Users list' })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async getAll() {
    return await this.usersService.getAll();
  }
}
