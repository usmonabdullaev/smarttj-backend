import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AdminNotificationModule } from '@/modules/admin/notification/notification.module';
import { AdminProductsModule } from '@/modules/admin/products/products.module';
import { AdminUsersModule } from '@/modules/admin/users/users.module';
import { AdminAIModule } from '@/modules/admin/ai/ai.module';

@Module({
  imports: [
    AdminAIModule,
    AdminUsersModule,
    AdminProductsModule,
    AdminNotificationModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [
          AdminAIModule,
          AdminUsersModule,
          AdminProductsModule,
          AdminNotificationModule,
        ],
      },
    ]),
  ],
})
export class AdminModule {}
