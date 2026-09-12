import { Module } from '@nestjs/common';

import { AdminPartnersController } from './partners.controller';
import { AdminPartnersService } from './partners.service';

@Module({
  controllers: [AdminPartnersController],
  providers: [AdminPartnersService],
  exports: [AdminPartnersService],
})
export class AdminPartnersModule {}
