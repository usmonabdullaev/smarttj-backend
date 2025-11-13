import { PrismaClient } from '@prisma/client';
import seedUsers from './users.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  await seedUsers(prisma);

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
