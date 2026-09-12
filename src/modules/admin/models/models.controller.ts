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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { AdminModelsService } from './models.service';
import {
  AdminCreateModelDto,
  AdminGetModelsDto,
  AdminUpdateModelDto,
} from './dto';

@ApiTags('Admin - Модели')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('models')
export class AdminModelsController {
  constructor(private readonly modelsService: AdminModelsService) {}

  @Get()
  @ApiOperation({
    summary: 'Список всех моделей с пагинацией, фильтром по бренду и поиском',
  })
  async getAll(@Query() query: AdminGetModelsDto) {
    return await this.modelsService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детали модели по ID' })
  async getById(@Param('id') id: string) {
    return await this.modelsService.getById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Создать новую модель' })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: AdminCreateModelDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.modelsService.create(dto, file);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Обновить модель' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateModelDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.modelsService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить модель' })
  async delete(@Param('id') id: string) {
    return await this.modelsService.delete(id);
  }
}
