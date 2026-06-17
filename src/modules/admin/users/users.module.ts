import { Module } from '@nestjs/common';

import { AdminUsersController } from '@/modules/admin/users/users.controller';
import { AdminUsersService } from '@/modules/admin/users/users.service';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
