import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  ProductListResponseDto,
  ProductResponseDto,
} from '@/modules/products/dto/product-response.dto';
import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { ProductsService } from '@/modules/products/products.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';

@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список всех товаров (каталог с фильтрами)',
  })
  @ApiOkResponse({ type: ProductListResponseDto })
  async getAll(@Query() query: GetProductsQueryDto) {
    return await this.productsService.getAll(query);
  }

  @Get('category/:slug')
  @ApiOperation({ summary: 'Category Products' })
  @ApiOkResponse({ type: ProductListResponseDto })
  async getCategoryProducts(
    @Param('slug') categorySlug: string,
    @Query() query: GetProductsQueryDto,
  ) {
    return await this.productsService.getCategoryProducts(categorySlug, query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getBySlug(@Param('slug') slug: string) {
    return await this.productsService.getBySlug(slug);
  }
}
