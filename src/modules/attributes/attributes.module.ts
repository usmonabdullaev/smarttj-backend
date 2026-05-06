import { Module } from '@nestjs/common';

import { AttributesController } from '@/modules/attributes/attributes.controller';
import { AttributesService } from '@/modules/attributes/attributes.service';

@Module({
  controllers: [AttributesController],
  providers: [AttributesService],
})
export class AttributesModule {}
