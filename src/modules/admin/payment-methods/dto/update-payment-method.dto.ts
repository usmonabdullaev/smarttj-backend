import { PartialType } from '@nestjs/swagger';
import { AdminCreatePaymentMethodDto } from './create-payment-method.dto';

export class AdminUpdatePaymentMethodDto extends PartialType(
  AdminCreatePaymentMethodDto,
) {}
