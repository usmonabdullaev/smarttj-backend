import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Category, ConflictRes } from './entities/category.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Получить все категории верхного уровня' })
  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @ApiOperation({ summary: 'Получить дерево категории' })
  @Get('tree')
  async getTree() {
    return await this.categoryService.getTree();
  }

  @ApiOperation({ summary: 'Получить категорию с подкотегориям' })
  @Get(':id/children')
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOneWithChilds(id);
  }

  @ApiOperation({ summary: 'Создать категорию', operationId: 'create' })
  @ApiResponse({
    status: 200,
    description: 'Категория создан успешно',
    type: Category,
  })
  @ApiResponse({
    status: 409,
    description: 'Категория с такой slug уже сушествует',
    type: ConflictRes,
  })
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.create(dto);
  }

  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.categoryService.delete(id);
  }
}
