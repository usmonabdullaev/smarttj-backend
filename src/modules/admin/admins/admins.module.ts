import { Module } from '@nestjs/common';

import { PasswordModule } from '@/common/services/password/password.module';
import { AdminAdminsController } from './admins.controller';
import { AdminAdminsService } from './admins.service';

@Module({
  imports: [PasswordModule],
  controllers: [AdminAdminsController],
  providers: [AdminAdminsService],
  exports: [AdminAdminsService],
})
export class AdminAdminsModule {}
