import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
