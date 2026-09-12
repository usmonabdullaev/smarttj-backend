import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { AdminCategoriesController } from '@/modules/admin/categories/categories.controller';
import { AdminCategoriesService } from '@/modules/admin/categories/categories.service';
import { AdminCategoriesRepository } from './categories.repository';
import { CategoryRepository } from '@/common/repositories';

@Module({
  imports: [CloudinaryModule],
  controllers: [AdminCategoriesController],
  providers: [
    AdminCategoriesService,
    AdminCategoriesRepository,
    CategoryRepository,
  ],
  exports: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
