import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma/prisma.module';
import { AdminPayoutsController } from './payouts.controller';
import { AdminPayoutsService } from './payouts.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPayoutsController],
  providers: [AdminPayoutsService],
  exports: [AdminPayoutsService],
})
export class AdminPayoutsModule {}
