import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Express } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetAllRequest } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('categories')
export class AdminCategoriesController {
  constructor(
    private readonly service: AdminCategoriesService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get categories' })
  async getAll(@Query() query: GetAllRequest) {
    return await this.service.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category' })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Post(':id/icon')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload category icon' })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
