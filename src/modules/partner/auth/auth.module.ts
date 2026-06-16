import { Module } from '@nestjs/common';

import { PartnerAuthController } from '@/modules/partner/auth/auth.controller';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { JwtAuthModule } from '@/auth/jwt/jwt-auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SmsModule } from '@/sms/sms.module';

@Module({
  imports: [AuthModule, SmsModule, JwtAuthModule, UsersModule],
  controllers: [PartnerAuthController],
  providers: [PartnerAuthService],
  exports: [PartnerAuthService],
})
export class PartnerAuthModule {}
