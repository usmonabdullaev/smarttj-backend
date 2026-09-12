import { Module } from '@nestjs/common';

import { AdminTransactionsController } from './transactions.controller';
import { AdminTransactionsService } from './transactions.service';

@Module({
  controllers: [AdminTransactionsController],
  providers: [AdminTransactionsService],
  exports: [AdminTransactionsService],
})
export class AdminTransactionsModule {}
