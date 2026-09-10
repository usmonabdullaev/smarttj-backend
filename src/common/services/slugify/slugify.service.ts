import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

import { SlugifyGenerator } from './slugify.generator';
import { RequestDto } from './dto/request.dto';

@Injectable()
export class SlugifyService {
  constructor(private readonly generator: SlugifyGenerator) {}

  async product(dto: RequestDto) {
    const slug = this.textToSlug(dto.slug);

    return await this.generator.product({ slug, excludeId: dto.excludeId });
  }

  async blog(dto: RequestDto) {
    const slug = this.textToSlug(dto.slug);

    return await this.generator.blog({ slug, excludeId: dto.excludeId });
  }

  private textToSlug(text: string) {
    return slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
}
