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

import { ProductResponseDto } from './dto/product-response.dto';
import { ApiErrorDto } from '../../common/dto/api-error.dto';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('main/:id')
  @ApiOperation({ summary: 'Product main API' })
  async getList(@Param('id') id: string, @Query() query: GetProductsQueryDto) {
    return await this.productsService.getList(id, query);
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
