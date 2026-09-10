import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { SlugifyService } from '@/common/services/slugify/slugify.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { AdminBlogsRepository } from './blogs.repository';
import { BlogRepository } from '@/common/repositories';
import { CreateRequest, UpdateRequest } from './dto';

@Injectable()
export class AdminBlogsService {
  constructor(
    private readonly repository: AdminBlogsRepository,
    private readonly blogRepository: BlogRepository,
    private readonly cloudinary: CloudinaryService,
    private readonly slugify: SlugifyService,
  ) {}

  async getAll() {
    return await this.blogRepository.getAll();
  }

  async getById(id: string) {
    const blog = await this.repository.getById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async create(dto: CreateRequest) {
    const upload = await this.cloudinary.uploadFile({
      file: dto.banner,
      folder: 'blog',
    });

    if (!upload) {
      throw new ServiceUnavailableException({
        message: 'Cloudinary error',
        code: 'CLOUDINARY_ERROR',
        error: dto.banner,
      });
    }

    const slug = await this.slugify.blog({ slug: dto.slug || dto.title });

    return await this.repository.create({
      slug,
      title: dto.title,
      content: dto.content,
      tag: dto.tag,
      readingTime: dto.readingTime,
      banner: upload.secure_url,
      bannerId: upload.public_id,
    });
  }

  async update(id: string, dto: UpdateRequest) {
    const blog = await this.repository.getById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const upload =
      dto.banner &&
      (await this.cloudinary.uploadFile({ file: dto.banner, folder: 'blog' }));

    if (upload && blog.bannerId) {
      await this.cloudinary.deleteFile(blog.bannerId);
    }

    const slug =
      (dto.slug || dto.title) &&
      (await this.slugify.blog({
        slug: dto.slug || dto.title || blog.slug,
      }));

    return await this.repository.update(id, {
      slug,
      title: dto.title,
      content: dto.content,
      tag: dto.tag,
      readingTime: dto.readingTime,
      banner: upload?.secure_url,
      bannerId: upload?.public_id,
    });
  }

  async delete(id: string) {
    const blog = await this.repository.getById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.bannerId) {
      await this.cloudinary.deleteFile(blog.bannerId);
    }

    return await this.repository.delete(id);
  }
}
