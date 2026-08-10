import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { RegionsService } from '@/modules/regions/regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get regions' })
  async findAll() {
    return await this.regionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  async findOne(@Param('id') id: string) {
    return await this.regionsService.findOne(id);
  }
}
