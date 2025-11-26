import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export default async function seedUsers(prisma: PrismaClient) {
  console.log(' → Seeding users...');

  const password = await bcrypt.hash('admin', 10);

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com', role: UserRole.ADMIN },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@gmail.com',
      phone: '900000000',
      password,
      role: UserRole.ADMIN,
    },
  });
}
