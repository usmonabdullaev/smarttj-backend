import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminProductsService } from '@/modules/admin/products/products.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products' })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.adminProductsService.getAll(page, limit);
  }

  @Get('moderate')
  @ApiOperation({ summary: 'Get in moderate products' })
  async getInModerate(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.adminProductsService.getInModerate(page, limit);
  }

  @Get('single/:id')
  @ApiOperation({ summary: 'Get single product' })
  async getById(@Param('id') id: string) {
    return await this.adminProductsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Publish product' })
  async publish(@Param('id') id: string) {
    return await this.adminProductsService.publish(id);
  }
}
