import { PrismaClient } from '@prisma/client';

export default async function seedPaymentMethods(prisma: PrismaClient) {
  console.log(' → Seeding payment methods...');

  const paymentMethods = await prisma.paymentMethod.findMany();

  if (paymentMethods.length === 0) {
    await prisma.paymentMethod.createMany({
      data: [
        { name: 'Наличными', type: 'CASH' },
        { name: 'Картой', type: 'CARD' },
      ],
    });
  }
}
