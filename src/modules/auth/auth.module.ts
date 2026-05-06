import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { GoogleOAuthModule } from '@/auth/google/google-oauth.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { JwtAuthModule } from '@/auth/jwt/jwt-auth.module';
import { AuthService } from '@/modules/auth/auth.service';
import { SmsModule } from '@/sms/sms.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    SmsModule,
    JwtAuthModule,
    GoogleOAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, AuthService, PassportModule],
})
export class AuthModule {}
