import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import {
  ProductListResponseDto,
  ProductResponseDto,
} from '@/modules/products/dto/product-response.dto';
import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { ProductsService } from '@/modules/products/products.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('category/:slug')
  @ApiOperation({ summary: 'Category Products' })
  @ApiOkResponse({ type: ProductListResponseDto })
  async getCategoryProducts(
    @Param('slug') categorySlug: string,
    @Query() query: GetProductsQueryDto,
  ) {
    return await this.productsService.getCategoryProducts(categorySlug, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getById(@Param('id') id: string) {
    return await this.productsService.getById(id);
  }
}
