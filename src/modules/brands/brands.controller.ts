import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Express } from 'express';
import {
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
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
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create brand' })
  @ApiCreatedResponse({ type: BrandResponseDto })
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
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: BrandResponseDto })
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
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
