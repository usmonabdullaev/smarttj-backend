import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';
import { GetCategoriesDto } from '@/modules/admin/categories/dto/get-categories.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('categories')
export class AdminCategoriesController {
  constructor(
    private readonly adminCategoriesService: AdminCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get categories' })
  async getAll(@Query() query: GetCategoriesDto) {
    return await this.adminCategoriesService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category' })
  async getById(@Param('id') id: string) {
    return await this.adminCategoriesService.getById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  async publish(@Param('id') id: string) {
    return await this.adminCategoriesService.delete(id);
  }
}
