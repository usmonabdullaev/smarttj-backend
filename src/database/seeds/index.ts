import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import { seedPaymentMethods } from './payment-methods.seed';
import { seedUsers } from './users.seed';
import { seedCategories } from './categories.seed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('🌱 Start seeding...');

  await seedUsers(prisma);
  await seedPaymentMethods(prisma);
  await seedCategories(prisma);

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
