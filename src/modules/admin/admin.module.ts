import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { UsersModule } from '@/modules/admin/users/users.module';
import { AIModule } from '@/modules/admin/ai/ai.module';

@Module({
  imports: [
    AIModule,
    UsersModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [AIModule, UsersModule],
      },
    ]),
  ],
})
export class AdminModule {}
