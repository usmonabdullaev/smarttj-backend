import { CreatePaymentMethodDto } from '../../../modules/payment-methods/dto/create-payment-method.dto';

export const PAYMENT_METHODS: CreatePaymentMethodDto[] = [
  { name: 'Наличными', type: 'CASH', isActive: true },
  { name: 'Картой', type: 'CARD', isActive: true },
];
