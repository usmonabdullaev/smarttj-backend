import { Controller, Get, Param } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  async findAll() {
    return await this.regionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.regionsService.findOne(id);
  }
}
