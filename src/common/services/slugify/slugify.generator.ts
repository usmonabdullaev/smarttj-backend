import { ProductRepository, RegionRepository } from '@/common/repositories';

export class SlugifyGenerator {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly regionRepository: RegionRepository,
  ) {}

  async product(slug: string, excludeId?: string) {
    let unique = slug;
    let counter = 2;

    while (true) {
      const existing = await this.productRepository.getIdBySlug(unique);

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
      const existing = await this.regionRepository.getIdBySlug(unique);

      if (!existing || existing.id === excludeId) {
        return unique;
      }

      unique = `${slug}-${counter}`;
      counter++;
    }
  }
}
