import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { BrandsService } from '@/modules/brands/brands.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { BrandResponseDto, FindQuery } from './dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get brands list' })
  @ApiOkResponse({ type: BrandResponseDto, isArray: true })
  async findAll(@Query() query: FindQuery) {
    return await this.brandsService.findAll(query);
  }

  @Get('/:slug')
  @ApiOperation({ summary: 'Get brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async findBySlug(@Param('slug') slug: string) {
    return await this.brandsService.findBySlug(slug);
  }

  @Get('/id/:id')
  @ApiOperation({ summary: 'Get brand' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async findById(@Param('id') id: string) {
    return await this.brandsService.findById(id);
  }
}
