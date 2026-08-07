import { Module } from '@nestjs/common';

import { AdminCategoriesController } from '@/modules/admin/categories/categories.controller';
import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';

@Module({
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
