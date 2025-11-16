import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
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
  UseGuards,
} from '@nestjs/common';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ModelResponseDto } from './dto/model-response.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelsService } from './models.service';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('models')
export class ModelsController {
  constructor(
    private readonly brandsService: ModelsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create model' })
  @ApiResponse({ status: 201, type: ModelResponseDto })
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
  @ApiOperation({ summary: 'Get list' })
  @ApiResponse({ status: 200, type: ModelResponseDto, isArray: true })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get model' })
  @ApiResponse({ status: 200, type: ModelResponseDto })
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update model' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, type: ModelResponseDto })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete model' })
  @ApiResponse({ status: 200, type: ModelResponseDto })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
