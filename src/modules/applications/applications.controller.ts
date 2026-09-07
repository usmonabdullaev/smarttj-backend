import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { CreateRequest } from './dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create application' })
  async create(@Body() dto: CreateRequest) {
    return await this.service.create(dto);
  }
}
