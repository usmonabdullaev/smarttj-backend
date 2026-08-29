import { Module } from '@nestjs/common';

import { PasswordModule } from '../password/password.module';
import { OtpService } from './otp.service';

@Module({
  imports: [PasswordModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
