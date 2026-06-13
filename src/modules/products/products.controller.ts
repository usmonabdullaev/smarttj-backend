import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ProductResponseDto } from '@/modules/products/dto/product-response.dto';
import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { ProductsService } from '@/modules/products/products.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('category/:id')
  @ApiOperation({ summary: 'Category Products' })
  async getList(
    @Param('id') categoryId: string,
    @Query() query: GetProductsQueryDto,
  ) {
    return await this.productsService.getList(categoryId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getById(@Param('id') id: string) {
    return await this.productsService.getById(id);
  }
}
