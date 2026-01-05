import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

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
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
