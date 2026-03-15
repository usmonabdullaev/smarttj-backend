import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const ADMIN_PHONE = process.env.ADMIN_PHONE as string;
const ADMIN_NAME = process.env.ADMIN_NAME as string;

const ADMIN = {
  name: ADMIN_NAME,
  email: ADMIN_EMAIL,
  phone: ADMIN_PHONE,
  role: UserRole.SYSADMIN,
};

export const seedUsers = async (prisma: PrismaClient) => {
  console.log(' → Seeding users...');

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN.email, role: ADMIN.role },
    update: { ...ADMIN, password },
    create: { ...ADMIN, password },
  });
};
