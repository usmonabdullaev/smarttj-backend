import { Module } from '@nestjs/common';

import { UsersController } from '@/modules/admin/users/users.controller';
import { UsersService } from '@/modules/admin/users/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
