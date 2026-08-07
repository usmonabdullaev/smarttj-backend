import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AdminNotificationModule } from '@/modules/admin/notification/notification.module';
import { AdminCategoriesModule } from '@/modules/admin/categories/categories.module';
import { AdminProductsModule } from '@/modules/admin/products/products.module';
import { AdminReportsModule } from '@/modules/admin/reports/reports.module';
import { AdminUsersModule } from '@/modules/admin/users/users.module';
import { AdminAIModule } from '@/modules/admin/ai/ai.module';

const ADMIN_MODULES = [
  AdminAIModule,
  AdminUsersModule,
  AdminProductsModule,
  AdminNotificationModule,
  AdminReportsModule,
  AdminCategoriesModule,
];

@Module({
  imports: [
    ...ADMIN_MODULES,
    RouterModule.register([
      {
        path: 'admin',
        children: ADMIN_MODULES,
      },
    ]),
  ],
})
export class AdminModule {}
