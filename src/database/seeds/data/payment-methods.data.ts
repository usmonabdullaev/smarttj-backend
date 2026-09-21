import { PaymentMethodType, Prisma } from '@prisma/client';

export const PAYMENT_METHODS: Prisma.PaymentMethodCreateManyInput[] = [
  {
    code: 'CASH',
    provider: 'CASH',
    commissionRate: 0,
    name: 'Наличными',
    isActive: true,
    type: PaymentMethodType.CASH,
  },
];
