import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  AdminCreateRegionDto,
  AdminRegionResponseDto,
  AdminUpdateRegionDto,
} from './dto';
import { AdminRegionsService } from './regions.service';

@ApiTags('Admin - Регионы доставки')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('regions')
export class AdminRegionsController {
  constructor(private readonly regionsService: AdminRegionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить плоский список всех регионов с подсчетом связей',
  })
  @ApiOkResponse({ type: [AdminRegionResponseDto] })
  async getAll() {
    return await this.regionsService.getAll();
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Получить иерархическое дерево регионов и городов',
  })
  @ApiOkResponse({ type: [AdminRegionResponseDto] })
  async getTree() {
    return await this.regionsService.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить регион по ID со списком подрегионов' })
  @ApiParam({ name: 'id', description: 'ID региона' })
  @ApiOkResponse({ type: AdminRegionResponseDto })
  async getById(@Param('id') id: string) {
    return await this.regionsService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый регион или город' })
  @ApiCreatedResponse({ type: AdminRegionResponseDto })
  async create(@Body() dto: AdminCreateRegionDto) {
    return await this.regionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить параметры региона' })
  @ApiParam({ name: 'id', description: 'ID региона' })
  @ApiOkResponse({ type: AdminRegionResponseDto })
  async update(@Param('id') id: string, @Body() dto: AdminUpdateRegionDto) {
    return await this.regionsService.update(id, dto);
  }

  @Patch(':id/default')
  @ApiOperation({
    summary:
      'Назначить регион регионом по умолчанию (снимает статус с предыдущего)',
  })
  @ApiParam({ name: 'id', description: 'ID региона' })
  @ApiOkResponse({ type: AdminRegionResponseDto })
  async setDefault(@Param('id') id: string) {
    return await this.regionsService.setDefault(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Удалить регион (заблокировано, если есть дочерние районы, товары или адреса)',
  })
  @ApiParam({ name: 'id', description: 'ID региона' })
  async delete(@Param('id') id: string) {
    return await this.regionsService.delete(id);
  }
}
