import { PrismaClient } from '@prisma/client';

import { BRANDS } from './data/brands.data';

export const seedBrands = async (prisma: PrismaClient) => {
  console.log(' → Seeding brands...');

  const brandsCount = await prisma.brand.count();

  if (brandsCount === 0) {
    await prisma.brand.createMany({
      data: BRANDS.map((brand) => ({
        name: brand.name,
        slug: brand.slug,
        popular: brand.popular,
      })),
    });
  }
};
