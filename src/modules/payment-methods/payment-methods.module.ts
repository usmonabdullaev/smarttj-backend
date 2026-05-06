import { Module } from '@nestjs/common';

import { PaymentMethodsController } from '@/modules/payment-methods/payment-methods.controller';
import { PaymentMethodsService } from '@/modules/payment-methods/payment-methods.service';

@Module({
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
