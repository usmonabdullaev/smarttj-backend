import { createObserveModule } from '@nestjs/observe';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { OpenLoggerModule } from 'open-logger';

import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpClientModule } from './infra/http-client/http-client.module';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { DefaultModule } from '@/modules/default.module';
import { validate } from './validations/env.validation';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY!,
      appSecret: process.env.OBSERVE_APP_SECRET!,
      serviceId: 'smarttj-backend',
      http: {
        ignore: ['/server'],
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        username: process.env.REDIS_USERNAME,
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    OpenLoggerModule.forRoot(),
    HttpClientModule.forRoot({
      serviceName: 'smarttj-backend',
      secret: process.env.INTERNAL_SERVICE_SECRET || '',
    }),
    PrismaModule,
    CloudinaryModule,
    DefaultModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
