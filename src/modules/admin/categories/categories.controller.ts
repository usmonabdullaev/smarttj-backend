import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Express } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import {
  AdminCreateCategoryDto,
  AdminGetCategoriesDto,
  AdminUpdateCategoryDto,
} from './dto';

@ApiTags('Admin - Категории')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('categories')
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Список категорий с пагинацией, поиском и фильтрацией',
  })
  async getAll(@Query() query: AdminGetCategoriesDto) {
    return await this.service.getAll(query);
  }

  @Get('tree')
  @ApiOperation({
    summary:
      'Иерархическое дерево всех категорий со всеми уровнями вложенности',
  })
  async getTree() {
    return await this.service.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детальную информацию о категории по ID' })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Создать категорию' })
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() dto: AdminCreateCategoryDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return await this.service.create(dto, icon);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Обновить категорию' })
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateCategoryDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return await this.service.update(id, dto, icon);
  }

  @Post(':id/icon')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить/заменить иконку категории' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['icon'],
    },
  })
  @UseInterceptors(FileInterceptor('icon'))
  async uploadIcon(
    @Param('id') id: string,
    @UploadedFile() icon: Express.Multer.File,
  ) {
    return await this.service.uploadIcon(id, icon);
  }

  @Delete(':id/icon')
  @ApiOperation({ summary: 'Удалить иконку категории' })
  async deleteIcon(@Param('id') id: string) {
    return await this.service.deleteIcon(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
