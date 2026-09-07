import { Module } from '@nestjs/common';

import { ApplicationsRepository } from './applications.repository';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule {}
