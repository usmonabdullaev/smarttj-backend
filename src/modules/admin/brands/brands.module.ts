import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { AdminBrandsController } from './brands.controller';
import { AdminBrandsService } from './brands.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [AdminBrandsController],
  providers: [AdminBrandsService],
  exports: [AdminBrandsService],
})
export class AdminBrandsModule {}
