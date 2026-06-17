import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AdminUsersModule } from '@/modules/admin/users/users.module';
import { AdminAIModule } from '@/modules/admin/ai/ai.module';

@Module({
  imports: [
    AdminAIModule,
    AdminUsersModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [AdminAIModule, AdminUsersModule],
      },
    ]),
  ],
})
export class AdminModule {}
