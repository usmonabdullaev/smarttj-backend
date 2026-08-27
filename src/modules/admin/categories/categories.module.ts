import { Module } from '@nestjs/common';

import { AdminCategoriesController } from '@/modules/admin/categories/categories.controller';
import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';
import { CategoryRepository } from '@/common/repositories';

@Module({
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService, CategoryRepository],
})
export class AdminCategoriesModule {}
