import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ProductResponseDto } from '@/modules/products/dto/product-response.dto';
import { GetProductsQueryDto } from '@/modules/products/dto/get-products.dto';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
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

  @Post()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async deleteProduct(@Param('id') id: string) {
    return await this.productsService.deleteProduct(id);
  }
}
