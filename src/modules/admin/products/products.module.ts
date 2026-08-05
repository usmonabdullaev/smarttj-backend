import { Module } from '@nestjs/common';

import { AdminProductsController } from '@/modules/admin/products/products.controller';
import { AdminProductsService } from '@/modules/admin/products/products.service';

@Module({
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
