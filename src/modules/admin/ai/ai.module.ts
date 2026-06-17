import { Module } from '@nestjs/common';

import { AdminAIController } from '@/modules/admin/ai/ai.controller';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { AIModule } from '@/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [AdminAIController],
  providers: [AdminAIService],
})
export class AdminAIModule {}
