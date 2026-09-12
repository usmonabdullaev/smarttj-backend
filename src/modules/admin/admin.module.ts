import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AdminNotificationModule } from '@/modules/admin/notification/notification.module';
import { AdminCategoriesModule } from '@/modules/admin/categories/categories.module';
import { AdminProductsModule } from '@/modules/admin/products/products.module';
import { AdminApplicationsModule } from './applications/applications.module';
import { AdminReportsModule } from '@/modules/admin/reports/reports.module';
import { AdminUsersModule } from '@/modules/admin/users/users.module';
import { AdminBannersModule } from './banners/banners.module';
import { AdminAIModule } from '@/modules/admin/ai/ai.module';
import { AdminBlogsModule } from './blogs/blogs.module';
import { AdminBrandsModule } from './brands/brands.module';
import { AdminModelsModule } from './models/models.module';
import { AdminPartnersModule } from './partners/partners.module';
import { AdminAdminsModule } from './admins/admins.module';
import { AdminStatisticsModule } from './statistics/statistics.module';
import { AdminOrdersModule } from './orders/orders.module';
import { AdminPaymentMethodsModule } from './payment-methods/payment-methods.module';
import { AdminRegionsModule } from './regions/regions.module';
import { AdminAttributesModule } from './attributes/attributes.module';
import { AdminTransactionsModule } from './transactions/transactions.module';

const ADMIN_MODULES = [
  AdminAIModule,
  AdminUsersModule,
  AdminPartnersModule,
  AdminAdminsModule,
  AdminProductsModule,
  AdminNotificationModule,
  AdminReportsModule,
  AdminCategoriesModule,
  AdminApplicationsModule,
  AdminBannersModule,
  AdminBlogsModule,
  AdminBrandsModule,
  AdminModelsModule,
  AdminStatisticsModule,
  AdminOrdersModule,
  AdminPaymentMethodsModule,
  AdminRegionsModule,
  AdminAttributesModule,
  AdminTransactionsModule,
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
