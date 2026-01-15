import { PrismaClient } from '@prisma/client';

import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-payment-method.dto';

const PAYMENT_METHODS: CreatePaymentMethodDto[] = [
  { name: 'Наличными', type: 'CASH', isActive: true },
  { name: 'Картой', type: 'CARD', isActive: true },
];

export default async function seedPaymentMethods(prisma: PrismaClient) {
  console.log(' → Seeding payment methods...');

  const paymentMethods = await prisma.paymentMethod.findMany();

  if (paymentMethods.length === 0) {
    await prisma.paymentMethod.createMany({
      data: PAYMENT_METHODS,
    });
  }
}
