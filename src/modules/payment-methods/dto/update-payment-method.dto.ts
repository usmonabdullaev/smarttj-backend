import { PartialType } from '@nestjs/swagger';

import { CreatePaymentMethodDto } from '@/modules/payment-methods/dto/create-payment-method.dto';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}
