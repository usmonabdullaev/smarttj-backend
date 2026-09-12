import { Module } from '@nestjs/common';

import { AdminAttributesController } from './attributes.controller';
import { AdminAttributesService } from './attributes.service';

@Module({
  controllers: [AdminAttributesController],
  providers: [AdminAttributesService],
  exports: [AdminAttributesService],
})
export class AdminAttributesModule {}
