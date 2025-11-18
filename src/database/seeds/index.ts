import { PrismaClient } from '@prisma/client';

import seedPaymentMethods from './payment-methods.seed';
import seedUsers from './users.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  await seedUsers(prisma);
  await seedPaymentMethods(prisma);

  console.log('🌱 Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
