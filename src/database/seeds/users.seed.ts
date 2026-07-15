import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SYSADMIN_EMAIL = process.env.SYSADMIN_EMAIL as string;
const SYSADMIN_PASSWORD = process.env.SYSADMIN_PASSWORD as string;
const SYSADMIN_PHONE = process.env.SYSADMIN_PHONE as string;
const SYSADMIN_NAME = process.env.SYSADMIN_NAME as string;

const ADMIN = {
  name: SYSADMIN_NAME,
  email: SYSADMIN_EMAIL,
  phone: SYSADMIN_PHONE,
  role: UserRole.SYSADMIN,
};

export const seedUsers = async (prisma: PrismaClient) => {
  console.log(' → Seeding users...');

  const password = await bcrypt.hash(SYSADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: {
      email_role: {
        email: ADMIN.email,
        role: ADMIN.role,
      },
    },
    update: { ...ADMIN, password },
    create: { ...ADMIN, password },
  });
};
