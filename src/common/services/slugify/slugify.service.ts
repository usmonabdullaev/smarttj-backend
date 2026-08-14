import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

import { SlugifyGenerator } from './slugify.generator';

@Injectable()
export class SlugifyService {
  constructor(private readonly generator: SlugifyGenerator) {}

  async product(base: string, excludeId?: string) {
    const slug = this.textToSlug(base);

    return await this.generator.product(slug, excludeId);
  }

  private textToSlug(text: string) {
    return slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
}
