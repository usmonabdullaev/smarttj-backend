import { Module } from '@nestjs/common';

import { CartsController } from '@/modules/carts/carts.controller';
import { CartsService } from '@/modules/carts/carts.service';

@Module({
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
