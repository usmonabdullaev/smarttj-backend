import { Module } from '@nestjs/common';

import { SupportController } from '@/modules/support/support.controller';
import { SupportService } from '@/modules/support/support.service';
import { AIService } from '@/ai/ai.service';

@Module({
  controllers: [SupportController],
  providers: [SupportService, AIService],
})
export class SupportModule {}
