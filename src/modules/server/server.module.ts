import { Module } from '@nestjs/common';

import { ServerController } from '@/modules/server/server.controller';
import { ServerService } from '@/modules/server/server.service';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
})
export class ServerModule {}
