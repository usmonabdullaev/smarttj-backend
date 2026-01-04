import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const ADMIN_PHONE = process.env.ADMIN_PHONE as string;

export default async function seedUsers(prisma: PrismaClient) {
  console.log(' → Seeding users...');

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.deleteMany();

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL, role: UserRole.ADMIN },
    update: {},
    create: {
      name: 'Administrator',
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password,
      role: UserRole.ADMIN,
    },
  });
}
