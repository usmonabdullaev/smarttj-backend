import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogRepository } from '@/common/repositories';

@Injectable()
export class BlogsService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async getAll() {
    return await this.blogRepository.getAll();
  }

  async getBySlug(slug: string) {
    const blog = await this.blogRepository.getBySlug(slug);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }
}
