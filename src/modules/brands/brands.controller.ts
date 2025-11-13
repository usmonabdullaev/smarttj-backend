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

import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandResponseDto } from './dto/brand-response.dto';
import { ApiErrorDto } from 'src/common/dto/api-error.dto';

@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  @ApiResponse({
    status: 201,
    type: BrandResponseDto,
    description: 'Created successfully',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorDto,
    description: 'Validation error',
  })
  @ApiResponse({ status: 409, type: ApiErrorDto, description: 'Conflict' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const upload = logo
      ? await this.cloudinary.uploadFile(logo, 'brand')
      : null;

    return await this.brandsService.create(
      {
        ...createBrandDto,
        logo: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get brands list' })
  @ApiResponse({
    status: 200,
    type: BrandResponseDto,
    isArray: true,
    description: 'Success',
  })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand' })
  @ApiResponse({ status: 200, type: BrandResponseDto, description: 'Success' })
  @ApiResponse({ status: 404, type: ApiErrorDto, description: 'Not found' })
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, type: BrandResponseDto, description: 'Updated' })
  @ApiResponse({
    status: 400,
    type: ApiErrorDto,
    description: 'Validation error',
  })
  @ApiResponse({ status: 404, type: ApiErrorDto, description: 'Not found' })
  @ApiResponse({ status: 409, type: ApiErrorDto, description: 'Conflict' })
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const upload = logo
      ? await this.cloudinary.uploadFile(logo, 'brand')
      : null;

    return this.brandsService.update(
      id,
      {
        ...updateBrandDto,
        logo: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  @ApiResponse({ status: 200, type: BrandResponseDto, description: 'Deleted' })
  @ApiResponse({ status: 404, type: ApiErrorDto, description: 'Not found' })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
