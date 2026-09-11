import { Module } from '@nestjs/common';

import { SupportController } from '@/modules/support/support.controller';
import { SupportService } from '@/modules/support/support.service';

@Module({
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
