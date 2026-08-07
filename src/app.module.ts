import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { DefaultModule } from '@/modules/default.module';
import { LoggerModule } from '@/logger/logger.module';
import { BullmqModule } from '@/bullmq/bullmq.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ScheduleModule.forRoot(),
    BullmqModule,
    LoggerModule,
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
