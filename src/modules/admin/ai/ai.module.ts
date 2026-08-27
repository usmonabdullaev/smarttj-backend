import { Module } from '@nestjs/common';

import { AdminAIController } from '@/modules/admin/ai/ai.controller';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { TransactionRepository } from '@/common/repositories';
import { OrderRepository } from '@/common/repositories';
import { AIModule } from '@/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [AdminAIController],
  providers: [AdminAIService, OrderRepository, TransactionRepository],
})
export class AdminAIModule {}
