import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ModelResponseDto } from './dto/model-response.dto';
import { ApiErrorDto } from 'src/common/dto/api-error.dto';

@Controller('models')
export class ModelsController {
  constructor(
    private readonly brandsService: ModelsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый модел' })
  @ApiResponse({ status: 201, type: ModelResponseDto })
  @ApiResponse({ status: 400, type: ApiErrorDto })
  @ApiResponse({ status: 409, type: ApiErrorDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createBrandDto: CreateModelDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const upload = image
      ? await this.cloudinary.uploadFile(image, 'model')
      : null;

    return await this.brandsService.create(
      {
        ...createBrandDto,
        image: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получит список' })
  @ApiResponse({ status: 200, type: ModelResponseDto, isArray: true })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получит информация о моделе' })
  @ApiResponse({ status: 200, type: ModelResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorDto })
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить модел' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, type: ModelResponseDto })
  @ApiResponse({ status: 400, type: ApiErrorDto })
  @ApiResponse({ status: 404, type: ApiErrorDto })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateModelDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const upload = image
      ? await this.cloudinary.uploadFile(image, 'model')
      : null;

    return this.brandsService.update(
      id,
      {
        ...updateBrandDto,
        image: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить модел' })
  @ApiResponse({ status: 200, type: ModelResponseDto })
  @ApiResponse({ status: 404, type: ApiErrorDto })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
