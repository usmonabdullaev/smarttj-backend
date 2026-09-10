import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminProductsService } from '@/modules/admin/products/products.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetAllRequest } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products' })
  async getAll(@Query() query: GetAllRequest) {
    return await this.adminProductsService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async getById(@Param('id') id: string) {
    return await this.adminProductsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Publish product' })
  async publish(@Param('id') id: string) {
    return await this.adminProductsService.publish(id);
  }
}
