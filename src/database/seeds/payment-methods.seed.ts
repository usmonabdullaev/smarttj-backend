import { PrismaClient } from '@prisma/client';

import { PAYMENT_METHODS } from './data/payment-methods.data';

export const seedPaymentMethods = async (prisma: PrismaClient) => {
  console.log(' → Seeding payment methods...');

  const paymentMethodsCount = await prisma.paymentMethod.count();

  if (paymentMethodsCount === 0) {
    await prisma.paymentMethod.createMany({
      data: PAYMENT_METHODS.map((paymentMethod) => ({
        name: paymentMethod.name,
        type: paymentMethod.type,
        isActive: paymentMethod.isActive,
      })),
    });
  }
};
