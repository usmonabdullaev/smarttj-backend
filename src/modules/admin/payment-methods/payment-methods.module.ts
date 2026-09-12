import { Module } from '@nestjs/common';

import { AdminPaymentMethodsController } from './payment-methods.controller';
import { AdminPaymentMethodsService } from './payment-methods.service';

@Module({
  controllers: [AdminPaymentMethodsController],
  providers: [AdminPaymentMethodsService],
  exports: [AdminPaymentMethodsService],
})
export class AdminPaymentMethodsModule {}
