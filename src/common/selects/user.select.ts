import { Prisma } from '@prisma/client';

export const userSelect = {
  id: true,
  phone: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  regionId: true,
  bonus: true,
  telegramId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
