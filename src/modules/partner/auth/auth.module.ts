import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

import { PartnerAuthController } from '@/modules/partner/auth/auth.controller';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { OtpModule } from '@/common/services/otp/otp.module';
import { JwtAuthModule } from '@/auth/jwt/jwt-auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SmsModule } from '@/sms/sms.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    AuthModule,
    SmsModule,
    JwtAuthModule,
    OtpModule,
    UsersModule,
  ],
  controllers: [PartnerAuthController],
  providers: [PartnerAuthService],
  exports: [PartnerAuthService, PassportModule],
})
export class PartnerAuthModule {}
