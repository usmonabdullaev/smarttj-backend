import { PrismaService } from '@/database/prisma/prisma.service';

export class SlugifyGenerator {
  constructor(private readonly prisma: PrismaService) {}

  async product(slug: string, excludeId?: string) {
    let unique = slug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: unique },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) {
        return unique;
      }

      unique = `${slug}-${counter}`;
      counter++;
    }
  }

  async region(slug: string, excludeId?: string) {
    let unique = slug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.region.findUnique({
        where: { slug: unique },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) {
        return unique;
      }

      unique = `${slug}-${counter}`;
      counter++;
    }
  }
}
