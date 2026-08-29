import { Module } from '@nestjs/common';

import { AdminUsersController } from '@/modules/admin/users/users.controller';
import { AdminUsersService } from '@/modules/admin/users/users.service';
import { BaseRepository, UserRepository } from '@/common/repositories';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, UserRepository, BaseRepository],
})
export class AdminUsersModule {}
