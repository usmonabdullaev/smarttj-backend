import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';

import { BannerResponse, GetListRequest } from './dto';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly service: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get banners' })
  @ApiOkResponse({ type: BannerResponse, isArray: true })
  async getList(@Query() query: GetListRequest) {
    return await this.service.getList(query);
  }
}
