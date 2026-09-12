import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SmsgateProvider } from './providers/smsgate.provider';
import { SmsService } from './sms.service';

@Module({
  imports: [ConfigModule],
  providers: [SmsgateProvider, SmsService],
  exports: [SmsService, SmsgateProvider],
})
export class SmsModule {}
