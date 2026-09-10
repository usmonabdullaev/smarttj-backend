import { Module } from '@nestjs/common';

import { BlogRepository } from '@/common/repositories';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, BlogRepository],
})
export class BlogsModule {}
