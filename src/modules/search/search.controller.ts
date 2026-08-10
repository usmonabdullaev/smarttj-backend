import { Controller, Get, Query } from '@nestjs/common';

import { SearchService } from '@/modules/search/search.service';
import { ApiOperation } from '@nestjs/swagger';
import { SearchQueryDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search products and not only' })
  async search(@Query() query: SearchQueryDto) {
    return await this.searchService.search(query);
  }
}
