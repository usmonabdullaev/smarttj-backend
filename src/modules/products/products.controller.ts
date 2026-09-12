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
import { GetProductBlocksQueryDto } from '@/modules/products/dto/get-product-blocks.dto';
import { ProductBlockDto } from '@/modules/products/dto/product-block-response.dto';
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

  @Get('blocks')
  @ApiOperation({
    summary: 'Получить блоки товаров для главной страницы',
    description:
      'Возвращает структурированные подборки товаров: Хиты продаж, Горячие скидки, Новинки, Высокий рейтинг и категорийные блоки (Смартфоны, Ноутбуки и др.)',
  })
  @ApiOkResponse({
    type: [ProductBlockDto],
    description: 'Массив блоков товаров',
  })
  async getBlocks(@Query() query: GetProductBlocksQueryDto) {
    return await this.productsService.getBlocks(query);
  }

  @Get('blocks/:type')
  @ApiOperation({
    summary: 'Получить конкретный блок товаров по типу или слагу категории',
    description:
      'Типы: bestsellers, discounts, new, top-rated или slug категории (например, smartfony)',
  })
  @ApiOkResponse({
    type: ProductBlockDto,
    description: 'Один блок товаров',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Блок или категория не найдены',
  })
  async getBlockByType(
    @Param('type') type: string,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.getBlockByType(type, limit);
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
