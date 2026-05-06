import { PrismaClient } from '@prisma/client';

import { CreatePaymentMethodDto } from '@/modules/payment-methods/dto/create-payment-method.dto';

const PAYMENT_METHODS: CreatePaymentMethodDto[] = [
  { name: 'Наличными', type: 'CASH', isActive: true },
  { name: 'Картой', type: 'CARD', isActive: true },
];

export const seedPaymentMethods = async (prisma: PrismaClient) => {
  console.log(' → Seeding payment methods...');

  const paymentMethodsCount = await prisma.paymentMethod.count();

  if (paymentMethodsCount === 0) {
    await prisma.paymentMethod.createMany({
      data: PAYMENT_METHODS,
    });
  }
};
