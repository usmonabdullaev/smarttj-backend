import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { AdminPartnersService } from './partners.service';
import {
  AdminGetPartnersDto,
  AdminUpdatePartnerDto,
  AdminUpdatePartnerStatusDto,
} from './dto';

@ApiTags('Admin - Партнёры')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('partners')
export class AdminPartnersController {
  constructor(private readonly service: AdminPartnersService) {}

  @Get()
  @ApiOperation({
    summary: 'Список всех партнёров с пагинацией, поиском и фильтрами',
  })
  async getAll(@Query() query: AdminGetPartnersDto) {
    return await this.service.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детальную информацию о партнёре по ID' })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные партнёра' })
  async update(@Param('id') id: string, @Body() dto: AdminUpdatePartnerDto) {
    return await this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Быстро изменить статус партнёра (ACTIVE, BLOCKED, IN_MODERATE)',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdatePartnerStatusDto,
  ) {
    return await this.service.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить партнёра (с проверкой на товары и заказы)',
  })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
