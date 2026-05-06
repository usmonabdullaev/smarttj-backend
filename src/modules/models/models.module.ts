import { Module } from '@nestjs/common';

import { ModelsController } from '@/modules/models/models.controller';
import { ModelsService } from '@/modules/models/models.service';

@Module({
  controllers: [ModelsController],
  providers: [ModelsService],
})
export class ModelsModule {}
