import { Module } from '@nestjs/common';

import { AuthModule as UserAuthModule } from '@/modules/auth/auth.module';
import { AuthController } from '@/modules/partner/auth/auth.controller';
import { AuthService } from '@/modules/partner/auth/auth.service';
import { JwtAuthModule } from '@/auth/jwt/jwt-auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { SmsModule } from '@/sms/sms.module';

@Module({
  imports: [UserAuthModule, SmsModule, JwtAuthModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
