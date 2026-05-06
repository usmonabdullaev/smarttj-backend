import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import { seedPaymentMethods } from '@/database/seeds/payment-methods.seed';
import { seedCategories } from '@/database/seeds/categories.seed';
import { seedRegions } from '@/database/seeds/regions.seed';
import { seedBrands } from '@/database/seeds/brands.seed';
import { seedUsers } from '@/database/seeds/users.seed';

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
  await seedBrands(prisma);
  await seedRegions(prisma);

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
