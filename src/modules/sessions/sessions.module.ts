import { Module } from '@nestjs/common';

import { SessionsController } from '@/modules/sessions/sessions.controller';
import { SessionsService } from '@/modules/sessions/sessions.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
