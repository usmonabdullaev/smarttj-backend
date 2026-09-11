import { Module } from '@nestjs/common';

import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AlifProvider } from './providers/alif.provider';

@Module({
  imports: [TransactionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, AlifProvider],
  exports: [PaymentsService, AlifProvider],
})
export class PaymentsModule {}
