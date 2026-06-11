import { PrismaClient } from '@prisma/client';

import { BRANDS } from './data/brands.data';

export const seedBrands = async (prisma: PrismaClient) => {
  console.log(' → Seeding brands...');

  const brandsCount = await prisma.brand.count();

  if (brandsCount === 0) {
    const seedFn = async (brands: any[]) => {
      for (const brand of brands) {
        await prisma.brand.create({
          data: {
            name: brand.name,
            slug: brand.slug,
            popular: brand.popular,
            models: {
              createMany: {
                data: brand.models.map((model: any) => ({
                  name: model.name,
                  slug: model.slug,
                  popular: model.popular,
                })),
              },
            },
          },
        });
      }
    };

    await seedFn(BRANDS);
  }
};
