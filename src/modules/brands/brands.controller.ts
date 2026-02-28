import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Express } from 'express';
import {
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
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

import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BrandsService } from './brands.service';
import { ApiErrorDto } from '../../common/dto/api-error.dto';

@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create brand' })
  @ApiCreatedResponse({ type: BrandResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() dto: CreateBrandDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const upload = logo
      ? await this.cloudinary.uploadFile(logo, 'brand')
      : null;

    return await this.brandsService.create(
      {
        ...dto,
        logo: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get brands list' })
  @ApiOkResponse({ type: BrandResponseDto, isArray: true })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const upload = logo
      ? await this.cloudinary.uploadFile(logo, 'brand')
      : null;

    return this.brandsService.update(
      id,
      {
        ...dto,
        logo: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  @ApiForbiddenResponse({ type: ApiErrorDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
