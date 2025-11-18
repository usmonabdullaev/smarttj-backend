import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Express } from 'express';
import {
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModelResponseDto } from './dto/model-response.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ModelsService } from './models.service';

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
  @ApiCreatedResponse({ type: ModelResponseDto })
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
  @ApiOkResponse({ type: ModelResponseDto, isArray: true })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get model' })
  @ApiOkResponse({ type: ModelResponseDto })
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update model' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: ModelResponseDto })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateModelDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const upload = image
      ? await this.cloudinary.uploadFile(image, 'model')
      : null;

    return await this.brandsService.update(
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
  @ApiOkResponse({ type: ModelResponseDto })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
