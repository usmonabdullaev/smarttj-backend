import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [PrismaModule, BrandsModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
