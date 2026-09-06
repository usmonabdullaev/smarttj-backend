import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';

import { ModelResponseDto } from '@/modules/models/dto/model-response.dto';
import { ModelsService } from '@/modules/models/models.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get('brand/:id')
  @ApiOperation({ summary: 'Get brand models' })
  @ApiOkResponse({ type: ModelResponseDto, isArray: true })
  async findBrandModels(@Param('id') id: string) {
    return await this.modelsService.findBrandModels(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get model by slug' })
  @ApiOkResponse({ type: ModelResponseDto })
  async findOne(@Param('slug') slug: string) {
    return await this.modelsService.findOne(slug);
  }
}
