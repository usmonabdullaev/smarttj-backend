import { Module } from '@nestjs/common';

import { AIController } from '@/modules/admin/ai/ai.controller';
import { AIModule as GlobalAIModule } from '@/ai/ai.module';
import { AIService } from '@/modules/admin/ai/ai.service';

@Module({
  imports: [GlobalAIModule],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
