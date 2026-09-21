import { Prisma } from '@prisma/client';

export const REGIONS: Prisma.RegionCreateManyInput[] = [
  {
    title: 'Душанбе',
    order: 1,
    slug: 'dushanbe',
    default: true,
  },
  {
    title: 'Худжанд',
    order: 2,
    slug: 'khudjand',
    default: false,
  },
];
