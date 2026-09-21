import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
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
  Query,
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
import { JwtAuthGuard, RolesGuard, PartnerStatusGuard } from '@/auth/guards';
import { RequirePartnerStatus } from '@/common/decorators/partner-status.decorator';
import { PartnerStatus } from '@prisma/client';
import {
  CreateProductDto,
  CreateProductVariantDto,
  GetPartnerProductsDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateProductVariantDto,
  UpdateVariantStockDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard, PartnerStatusGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Products')
@Controller('products')
export class PartnerProductsController {
  constructor(
    private readonly partnerProductsService: PartnerProductsService,
    private readonly partnerAuthService: PartnerAuthService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get partner products',
    description: 'Returns products with pagination and category tree',
  })
  async getAll(
    @GetUser('sessionId') sessionId: string,
    @Query() query: GetPartnerProductsDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.getAll(profile.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id (with variants and images)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getById(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.getById(id, profile.id);
  }

  @Post()
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({ summary: 'Create product (status=DRAFT)' })
  async create(
    @GetUser('sessionId') sessionId: string,
    @Body() dto: CreateProductDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.create(profile.id, dto);
  }

  @Post('create/:categoryId')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({ summary: 'Create product with category in path' })
  async createWithCategory(
    @Param('categoryId') categoryId: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: CreateProductDto,
  ) {
    if (categoryId && !dto.categoryId) {
      dto.categoryId = categoryId;
    }
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.create(profile.id, dto);
  }

  @Put(':id')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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

  @Patch('variant/:id/stock')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({
    summary: 'Быстро обновить остаток варианта товара на складе',
    description:
      'Позволяет оперативно изменить количество товара на складе (stock >= 0)',
  })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async updateVariantStock(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: UpdateVariantStockDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.updateVariantStock(
      id,
      profile.id,
      dto.stock,
    );
  }

  @Post([':id/images', 'variant/:id/images', 'variants/:id/images'])
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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
  @ApiOperation({
    summary: 'Upload images for variant',
    description:
      'Поддерживает пути :id/images, variant/:id/images, variants/:id/images. :id — ID варианта (variantId).',
  })
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
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({ summary: 'Delete variant' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async deleteVariant(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.deleteVariant(id, profile.id);
  }

  @Post(':id/deactivate')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({ summary: 'Deactivate product (status=INACTIVE)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async deactivate(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.inactive(id, profile.id);
  }

  @Post(':id/activate')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({ summary: 'Activate product (status=ACTIVE)' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async activate(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.activate(id, profile.id);
  }

  @Patch(':id')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
  @ApiOperation({
    summary: 'Update product status / Deactivate product',
    description:
      'Без тела или с { "status": "INACTIVE" } деактивирует товар. С { "status": "ACTIVE" } активирует товар.',
  })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async updateStatus(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto?: UpdateProductStatusDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.partnerProductsService.updateStatus(
      id,
      profile.id,
      dto?.status,
      dto?.isActive,
    );
  }

  @Delete(':id')
  @RequirePartnerStatus(PartnerStatus.ACTIVE)
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
