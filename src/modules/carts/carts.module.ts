import { Module } from '@nestjs/common';

import { CartsController } from '@/modules/carts/carts.controller';
import { CartsService } from '@/modules/carts/carts.service';
import { CartsRepository } from './carts.repository';

@Module({
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
})
export class CartsModule {}
