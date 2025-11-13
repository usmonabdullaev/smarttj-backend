import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export default async function seedUsers(prisma: PrismaClient) {
  console.log(' → Seeding users...');

  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@smart.tj' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@smart.tj',
      phone: '900000000',
      password,
      role: 'ADMIN',
    },
  });
}
