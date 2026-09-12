import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { AdminModelsController } from './models.controller';
import { AdminModelsService } from './models.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [AdminModelsController],
  providers: [AdminModelsService],
  exports: [AdminModelsService],
})
export class AdminModelsModule {}
