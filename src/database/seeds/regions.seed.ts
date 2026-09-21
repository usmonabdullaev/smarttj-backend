import { PrismaClient } from '@prisma/client';

import { REGIONS } from './data/regions.data';

export const seedRegions = async (prisma: PrismaClient) => {
  console.log(' → Seeding regions...');

  const regionsCount = await prisma.region.count();

  if (regionsCount === 0) {
    await prisma.region.createMany({ data: REGIONS });
  }
};
