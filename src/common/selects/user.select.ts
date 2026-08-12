import { Prisma } from '@prisma/client';

export const userSelect = {
  id: true,
  phone: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  avatarId: true,
  regionId: true,
  bonus: true,
  emailVerified: true,
  googleId: true,
  telegramId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const publicUserSelect = {
  id: true,
  phone: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
