import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { StatisticsModule } from './modules/statistics/statistics.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ModelsModule } from './modules/models/models.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
