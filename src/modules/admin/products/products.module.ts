import { Module } from '@nestjs/common';

import { AdminProductsController } from '@/modules/admin/products/products.controller';
import { AdminProductsService } from '@/modules/admin/products/products.service';
import { AdminProductsRepository } from './products.repository';
import { ProductRepository } from '@/common/repositories';

@Module({
  controllers: [AdminProductsController],
  providers: [AdminProductsService, ProductRepository, AdminProductsRepository],
})
export class AdminProductsModule {}
