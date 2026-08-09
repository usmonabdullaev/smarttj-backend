import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AttributesService } from '@/modules/attributes/attributes.service';

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

  @Get('category/:id')
  @ApiOperation({ summary: 'Get category attributes' })
  async findByCategory(@Param('id') id: string) {
    return await this.attributesService.findByCategory(id);
  }
}
