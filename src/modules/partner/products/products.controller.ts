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
  UpdateProductDto,
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
  @ApiOperation({ summary: 'Get list of partner products' })
  async getList(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.getList(profile.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
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
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async update(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: UpdateProductDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.update(id, profile.id, dto);
  }

  @Post(':id/variant')
  @ApiOperation({ summary: 'Create variant (with optional attributes)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async createVariant(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.createVariant(id, profile.id, dto);
  }

  @Put('variant/:id')
  @ApiOperation({ summary: 'Update variant (price, stock, attributes)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async updateVariant(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.updateVariant(id, profile.id, dto);
  }

  @Post(':id/images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['images'],
    },
  })
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'Upload images for variant' })
  async uploadImages(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    const uploads = await this.cloudinary.uploadFiles({
      files: images,
      folder: 'images',
    });

    return await this.partnerProductsService.uploadImages(
      id,
      profile.id,
      uploads.map((upload, index) => ({
        url: upload.secure_url,
        urlId: upload.public_id,
        order: index + 1,
      })),
    );
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish product (status=AUTO_MODERATION)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async publish(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.publish(id, profile.id);
  }

  @Delete('image/:id')
  @ApiOperation({ summary: 'Delete image' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async deleteImage(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.deleteImage(id, profile.id);
  }

  @Delete('variant/:id')
  @ApiOperation({ summary: 'Delete variant' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async deleteVariant(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.deleteVariant(id, profile.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Set product inactive (status=INACTIVE)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async inactive(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.inactive(id, profile.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (status=DELETED, soft delete)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async delete(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.delete(id, profile.id);
  }
}
