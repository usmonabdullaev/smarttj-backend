import { Controller, Get, Param } from '@nestjs/common';

import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('main')
  async getMain() {
    return await this.categoriesService.getMain();
  }

  @Get('items/:id')
  async getItems(@Param('id') id: string) {
    return await this.categoriesService.getItems(id);
  }

  @Get('tree')
  async tree() {
    return await this.categoriesService.tree();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.categoriesService.getById(id);
  }
}
