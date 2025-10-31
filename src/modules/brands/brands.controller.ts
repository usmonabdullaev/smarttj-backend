import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Express } from 'express';

import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый бренд' })
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
  @ApiOperation({ summary: 'Получит список' })
  async findAll() {
    return await this.brandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(+id, updateBrandDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.brandsService.remove(id);
  }
}
