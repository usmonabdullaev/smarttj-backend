import dotenv from 'dotenv';
import type { PrismaConfig } from 'prisma';

dotenv.config();

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;
