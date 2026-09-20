import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AttributesService } from '@/modules/attributes/attributes.service';
import { GetFilterableAttributesQueryDto } from './dto/get-filterable-attributes.dto';

@ApiTags('Атрибуты')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  async findAll() {
    return await this.attributesService.findAll();
  }

  @Get('filters')
  @ApiOperation({
    summary: 'Получить атрибуты для фильтрации товаров (filterable=true)',
    description:
      'Возвращает список фильтруемых атрибутов со значениями. Если указан categoryId (ID или slug), возвращает атрибуты этой категории, её родителей/детей и глобальные атрибуты.',
  })
  async getFilterableAttributes(
    @Query() query: GetFilterableAttributesQueryDto,
  ) {
    return await this.attributesService.getFilterableAttributes(
      query.categoryId,
    );
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
