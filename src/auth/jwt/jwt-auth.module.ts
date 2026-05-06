import { Module } from '@nestjs/common';

import { JwtAuthService } from '@/auth/jwt/jwt-auth.service';

@Module({
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
