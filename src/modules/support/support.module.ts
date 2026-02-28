import { Module } from '@nestjs/common';

import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
