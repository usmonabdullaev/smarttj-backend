import { Module } from '@nestjs/common';

import { TransactionRepository } from '@/common/repositories/transaction.repository';
import { OrderRepository } from '@/common/repositories/order.repository';
import { AdminAIController } from '@/modules/admin/ai/ai.controller';
import { AdminAIService } from '@/modules/admin/ai/ai.service';
import { AIModule } from '@/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [AdminAIController],
  providers: [AdminAIService, OrderRepository, TransactionRepository],
})
export class AdminAIModule {}
