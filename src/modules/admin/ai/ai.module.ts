import { Module } from '@nestjs/common';

import { AdminAIController } from '@/modules/admin/ai/ai.controller';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { TransactionRepository } from '@/common/repositories';
import { OrderRepository } from '@/common/repositories';

@Module({
  controllers: [AdminAIController],
  providers: [AdminAIService, OrderRepository, TransactionRepository],
})
export class AdminAIModule {}
