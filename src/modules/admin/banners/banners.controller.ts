import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  UseInterceptors,
} from '@nestjs/common';

import { CreateRequest, GetListRequest, UpdateRequest } from './dto';
import { AdminBannersService } from './banners.service';

@Controller('banners')
export class AdminBannersController {
  constructor(private readonly service: AdminBannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get banners list' })
  async getList(@Query() query: GetListRequest) {
    return await this.service.getList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  async getById(@Param('id') id: string) {
    return await this.service.getById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create banner' })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateRequest,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.service.create({
      title: dto.title,
      description: dto.description,
      position: dto.position,
      url: dto.url,
      image,
    });
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update banner' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRequest,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.service.update(id, {
      title: dto.title,
      description: dto.description,
      position: dto.position,
      url: dto.url,
      image,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete banner' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
