import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { PartnerProductsService } from '@/modules/partner/products/products.service';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import {
  CreateProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@Controller('products')
export class PartnerProductsController {
  constructor(
    private readonly partnerProductsService: PartnerProductsService,
    private readonly partnerAuthService: PartnerAuthService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get list' })
  async getList(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.getList(profile.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getById(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.getById(id, profile.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product (status=DRAFT)' })
  async create(
    @GetUser('sessionId') sessionId: string,
    @Body() dto: CreateProductDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.create(profile.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id') id: string, @Body() dto: CreateProductDto) {
    return await this.partnerProductsService.update(id, dto);
  }

  @Post(':id/variant')
  @ApiOperation({ summary: 'Create variant' })
  async createVariant(
    @Param('id') id: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return await this.partnerProductsService.createVariant(id, dto);
  }

  @Put('variant/:id')
  @ApiOperation({ summary: 'Update variant' })
  async updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return await this.partnerProductsService.updateVariant(id, dto);
  }

  @Post(':id/images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'Upload images' })
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const uploads = await this.cloudinary.uploadFiles({
      files: images,
      folder: 'images',
    });

    return await this.partnerProductsService.uploadImages(
      id,
      uploads.map((upload, index) => ({
        url: upload.secure_url,
        urlId: upload.public_id,
        order: index + 1,
      })),
    );
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish product (status=IN_MODERATE)' })
  async publish(@Param('id') id: string) {
    return await this.partnerProductsService.publish(id);
  }

  @Delete('image/:id')
  @ApiOperation({ summary: 'Delete image' })
  async deleteImage(@Param('id') id: string) {
    return await this.partnerProductsService.deleteImage(id);
  }

  @Delete('variant/:id')
  @ApiOperation({ summary: 'Delete variant' })
  async deleteVariant(@Param('id') id: string) {
    return await this.partnerProductsService.deleteVariant(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Inactive product (status=INACTIVE)' })
  async inactive(@Param('id') id: string) {
    return await this.partnerProductsService.inactive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (status=DELETED)' })
  async delete(@Param('id') id: string) {
    return await this.partnerProductsService.delete(id);
  }
}
