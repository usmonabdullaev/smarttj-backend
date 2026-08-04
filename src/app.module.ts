import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PaymentMethodsModule } from '@/modules/payment-methods/payment-methods.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { StatisticsModule } from '@/modules/statistics/statistics.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { AttributesModule } from '@/modules/attributes/attributes.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { ProductsModule } from '@/modules/products/products.module';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { SupportModule } from '@/modules/support/support.module';
import { ReportsModule } from '@/modules/reports/reports.module';
import { RegionsModule } from '@/modules/regions/regions.module';
import { PartnerModule } from '@/modules/partner/partner.module';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { BrandsModule } from '@/modules/brands/brands.module';
import { ModelsModule } from '@/modules/models/models.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { ServerModule } from '@/modules/server/server.module';
import { UsersModule } from '@/modules/users/users.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { CartsModule } from '@/modules/carts/carts.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { LoggerModule } from '@/logger/logger.module';
import { TelegramModule } from '@/modules/telegram/telegram.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CloudinaryModule,
    BrandsModule,
    UsersModule,
    AuthModule,
    ModelsModule,
    StatisticsModule,
    PaymentMethodsModule,
    SessionsModule,
    ProductsModule,
    CategoriesModule,
    SupportModule,
    ReportsModule,
    RegionsModule,
    AttributesModule,
    OrdersModule,
    CartsModule,
    ServerModule,
    AdminModule,
    PartnerModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
