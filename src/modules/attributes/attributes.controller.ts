import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { AttributesService } from '@/modules/attributes/attributes.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  async findAll() {
    return await this.attributesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one by ID' })
  async findOne(@Param('id') id: string) {
    return await this.attributesService.findOne(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get category attributes' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.attributesService.findByCategory(categoryId);
  }

  @Get('product/:categoryId')
  async findForProduct(@Param('categoryId') categoryId: string) {
    return await this.attributesService.findForProduct(categoryId);
  }
}
