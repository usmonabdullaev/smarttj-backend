import { Module } from '@nestjs/common';

import { AuthController } from '@/modules/partner/auth/auth.controller';
import { AuthService } from '@/modules/partner/auth/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
