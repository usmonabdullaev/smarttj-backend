import { PrismaClient } from '@prisma/client';

import { REGIONS } from './data/regions.data';

export const seedRegions = async (prisma: PrismaClient) => {
  console.log(' → Seeding regions...');

  const regionsCount = await prisma.region.count();

  if (regionsCount === 0) {
    const seedFn = async (regions: any[]) => {
      for (const region of regions) {
        await prisma.region.create({
          data: {
            title: region.title,
            slug: region.slug,
          },
        });
      }
    };

    await seedFn(REGIONS);
  }
};
