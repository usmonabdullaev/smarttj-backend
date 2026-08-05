import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AdminProductsModule } from '@/modules/admin/products/products.module';
import { AdminUsersModule } from '@/modules/admin/users/users.module';
import { AdminAIModule } from '@/modules/admin/ai/ai.module';

@Module({
  imports: [
    AdminAIModule,
    AdminUsersModule,
    AdminProductsModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [AdminAIModule, AdminUsersModule, AdminProductsModule],
      },
    ]),
  ],
})
export class AdminModule {}
