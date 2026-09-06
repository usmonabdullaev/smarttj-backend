import { Module } from '@nestjs/common';

import { ModelsController } from '@/modules/models/models.controller';
import { ModelsService } from '@/modules/models/models.service';
import { BrandRepository } from '@/common/repositories';
import { ModelsRepository } from './models.repository';

@Module({
  controllers: [ModelsController],
  providers: [ModelsService, ModelsRepository, BrandRepository],
})
export class ModelsModule {}
