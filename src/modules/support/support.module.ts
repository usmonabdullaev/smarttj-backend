import { Module } from '@nestjs/common';

import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
