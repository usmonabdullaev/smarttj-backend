import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { AdminAdminsService } from './admins.service';
import {
  AdminCreateAdminDto,
  AdminGetAdminsDto,
  AdminUpdateAdminDto,
} from './dto';

@ApiTags('Admin - Администраторы')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@Controller('admins')
export class AdminAdminsController {
  constructor(private readonly service: AdminAdminsService) {}

  @Get()
  @Roles(UserRole.SYSADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Список всех администраторов (SYSADMIN, ADMIN, MODERATOR). Доступ: SYSADMIN, ADMIN',
  })
  async getAll(@Query() query: AdminGetAdminsDto) {
    return await this.service.getAll(query);
  }

  @Get(':id')
  @Roles(UserRole.SYSADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Детальная информация об администраторе по ID. Доступ: SYSADMIN, ADMIN',
  })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Post()
  @Roles(UserRole.SYSADMIN)
  @ApiOperation({
    summary: 'Создать нового администратора (только SYSADMIN)',
  })
  async create(@Body() dto: AdminCreateAdminDto) {
    return await this.service.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.SYSADMIN)
  @ApiOperation({
    summary: 'Обновить данные администратора (только SYSADMIN)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateAdminDto,
    @GetUser('userId') currentUserId: string,
  ) {
    return await this.service.update(id, dto, currentUserId);
  }

  @Delete(':id')
  @Roles(UserRole.SYSADMIN)
  @ApiOperation({
    summary: 'Удалить администратора (только SYSADMIN)',
  })
  async delete(
    @Param('id') id: string,
    @GetUser('userId') currentUserId: string,
  ) {
    return await this.service.delete(id, currentUserId);
  }
}
