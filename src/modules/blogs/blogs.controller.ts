import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { BlogsService } from './blogs.service';
import { BlogResponse } from './dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get blogs' })
  @ApiOkResponse({ type: BlogResponse, isArray: true })
  async getAll() {
    return await this.service.getAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get blog by slug' })
  @ApiOkResponse({ type: BlogResponse })
  async getBySlug(@Param('slug') slug: string) {
    return await this.service.getBySlug(slug);
  }
}
