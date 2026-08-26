import { Module } from '@nestjs/common';

import { CategoriesController } from '@/modules/categories/categories.controller';
import { CategoryRepository } from '@/common/repositories/category.repository';
import { CategoriesService } from '@/modules/categories/categories.service';
import { CategoriesRepository } from './categories.repository';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, CategoryRepository],
})
export class CategoriesModule {}
