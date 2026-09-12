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
import { AdminBrandsService } from './brands.service';
import {
  AdminCreateBrandDto,
  AdminGetBrandsDto,
  AdminUpdateBrandDto,
} from './dto';

@ApiTags('Admin - Бренды')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('brands')
export class AdminBrandsController {
  constructor(private readonly brandsService: AdminBrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Список всех брендов с пагинацией и поиском' })
  async getAll(@Query() query: AdminGetBrandsDto) {
    return await this.brandsService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детали бренда по ID' })
  async getById(@Param('id') id: string) {
    return await this.brandsService.getById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Создать новый бренд' })
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() dto: AdminCreateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.brandsService.create(dto, file);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Обновить бренд' })
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.brandsService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить бренд' })
  async delete(@Param('id') id: string) {
    return await this.brandsService.delete(id);
  }
}
