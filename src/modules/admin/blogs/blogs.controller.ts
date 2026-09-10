import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { BlogResponse, CreateRequest, UpdateRequest } from './dto';
import { AdminBlogsService } from './blogs.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('blogs')
export class AdminBlogsController {
  constructor(private readonly service: AdminBlogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get blogs' })
  @ApiOkResponse({ type: BlogResponse, isArray: true })
  async getAll() {
    return await this.service.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiOkResponse({ type: BlogResponse })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create blog' })
  @ApiOkResponse({ type: BlogResponse })
  @UseInterceptors(FileInterceptor('banner'))
  async create(
    @Body() dto: CreateRequest,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    return await this.service.create({
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      tag: dto.tag,
      readingTime: dto.readingTime,
      banner,
    });
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update blog' })
  @ApiOkResponse({ type: BlogResponse })
  @UseInterceptors(FileInterceptor('banner'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRequest,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    return await this.service.update(id, {
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      tag: dto.tag,
      readingTime: dto.readingTime,
      banner,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiOkResponse({ type: BlogResponse })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
