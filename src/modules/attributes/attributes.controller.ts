import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AttributesService } from '@/modules/attributes/attributes.service';

@ApiTags('Атрибуты')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  async findAll() {
    return await this.attributesService.findAll();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get category attributes' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.attributesService.findByCategory(categoryId);
  }

  @Get('product/:categoryId')
  @ApiOperation({ summary: 'Get category and default attributes' })
  async findForProduct(@Param('categoryId') categoryId: string) {
    return await this.attributesService.findForProduct(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one by ID' })
  async findOne(@Param('id') id: string) {
    return await this.attributesService.findOne(id);
  }
}
