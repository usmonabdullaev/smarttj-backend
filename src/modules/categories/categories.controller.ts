import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CategoriesService } from '@/modules/categories/categories.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import {
  CategoriesTreeResponseDto,
  CategoryItemsResponseDto,
  CategoryResponseDto,
} from '@/modules/categories/dto/category-response.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('main')
  @ApiOperation({ summary: 'Get root categories' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  async getMain() {
    return await this.categoriesService.getMain();
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get category with childrens' })
  @ApiOkResponse({ type: CategoryItemsResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getItems(@Param('id') id: string) {
    return await this.categoriesService.getItems(id);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiOkResponse({ type: CategoriesTreeResponseDto, isArray: true })
  async tree() {
    return await this.categoriesService.tree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getById(@Param('id') id: string) {
    return await this.categoriesService.getById(id);
  }
}
