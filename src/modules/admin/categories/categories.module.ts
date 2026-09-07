import { Module } from '@nestjs/common';

import { AdminCategoriesController } from '@/modules/admin/categories/categories.controller';
import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';
import { AdminCategoriesRepository } from './categories.repository';
import { CategoryRepository } from '@/common/repositories';

@Module({
  controllers: [AdminCategoriesController],
  providers: [
    AdminCategoriesService,
    AdminCategoriesRepository,
    CategoryRepository,
  ],
})
export class AdminCategoriesModule {}
