import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/partner/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    RouterModule.register([
      {
        path: 'partner',
        children: [AuthModule],
      },
    ]),
  ],
})
export class PartnerModule {}
