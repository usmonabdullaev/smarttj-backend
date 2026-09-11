import { Module } from '@nestjs/common';

import { AdminAIController } from '@/modules/admin/ai/ai.controller';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { TransactionRepository } from '@/common/repositories';
import { OrderRepository } from '@/common/repositories';
import { AIService } from '@/ai/ai.service';

@Module({
  controllers: [AdminAIController],
  providers: [
    AdminAIService,
    OrderRepository,
    TransactionRepository,
    AIService,
  ],
})
export class AdminAIModule {}
