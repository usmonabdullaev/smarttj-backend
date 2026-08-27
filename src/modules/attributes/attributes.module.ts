import { Module } from '@nestjs/common';

import { AttributesController } from '@/modules/attributes/attributes.controller';
import { AttributesService } from '@/modules/attributes/attributes.service';
import { AttributesRepository } from './attributes.repository';
import { CategoryRepository } from '@/common/repositories';

@Module({
  controllers: [AttributesController],
  providers: [AttributesService, AttributesRepository, CategoryRepository],
})
export class AttributesModule {}
