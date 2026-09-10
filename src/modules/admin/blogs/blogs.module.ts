import { Module } from '@nestjs/common';

import { SlugifyModule } from '@/common/services/slugify/slugify.module';
import { AdminBlogsController } from './blogs.controller';
import { AdminBlogsRepository } from './blogs.repository';
import { BlogRepository } from '@/common/repositories';
import { AdminBlogsService } from './blogs.service';

@Module({
  imports: [SlugifyModule],
  controllers: [AdminBlogsController],
  providers: [AdminBlogsService, AdminBlogsRepository, BlogRepository],
})
export class AdminBlogsModule {}
