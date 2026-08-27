import { Module } from '@nestjs/common';

import { AdminUsersController } from '@/modules/admin/users/users.controller';
import { AdminUsersService } from '@/modules/admin/users/users.service';
import { UserRepository } from '@/common/repositories';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, UserRepository],
})
export class AdminUsersModule {}
