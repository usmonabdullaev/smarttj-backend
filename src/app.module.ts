import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ModelsModule } from './modules/models/models.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SupportModule } from './modules/support/support.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
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
    AdminModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
