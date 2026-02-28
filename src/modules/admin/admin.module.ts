import { Module } from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
