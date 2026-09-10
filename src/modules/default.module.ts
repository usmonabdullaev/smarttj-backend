import { Module } from '@nestjs/common';

import { PaymentMethodsModule } from '@/modules/payment-methods/payment-methods.module';
import { NotificationModule } from '@/modules/notifications/notifications.module';
import { StatisticsModule } from '@/modules/statistics/statistics.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { AttributesModule } from '@/modules/attributes/attributes.module';
import { ApplicationsModule } from './applications/applications.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { ProductsModule } from '@/modules/products/products.module';
import { TelegramModule } from '@/modules/telegram/telegram.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { SupportModule } from '@/modules/support/support.module';
import { RegionsModule } from '@/modules/regions/regions.module';
import { PartnerModule } from '@/modules/partner/partner.module';
import { AddressesModule } from './addresses/addresses.module';
import { BrandsModule } from '@/modules/brands/brands.module';
import { ModelsModule } from '@/modules/models/models.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { ServerModule } from '@/modules/server/server.module';
import { SearchModule } from '@/modules/search/search.module';
import { UsersModule } from '@/modules/users/users.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { CartsModule } from '@/modules/carts/carts.module';
import { BannersModule } from './banners/banners.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BrandsModule,
    ModelsModule,
    StatisticsModule,
    PaymentMethodsModule,
    SessionsModule,
    ProductsModule,
    CategoriesModule,
    SupportModule,
    RegionsModule,
    AttributesModule,
    OrdersModule,
    CartsModule,
    ServerModule,
    TelegramModule,
    NotificationModule,
    SearchModule,
    PaymentsModule,
    AddressesModule,
    ApplicationsModule,
    BannersModule,
    BlogsModule,

    PartnerModule,
    AdminModule,
  ],
})
export class DefaultModule {}
