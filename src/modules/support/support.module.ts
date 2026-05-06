import { Module } from '@nestjs/common';

import { SupportController } from '@/modules/support/support.controller';
import { SupportService } from '@/modules/support/support.service';
import { AIModule } from '@/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
