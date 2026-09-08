import { Module } from '@nestjs/common';

import { AdminApplicationsController } from './applications.controller';
import { AdminApplicationsRepository } from './applications.repository';
import { AdminApplicationsService } from './applications.service';

@Module({
  controllers: [AdminApplicationsController],
  providers: [AdminApplicationsService, AdminApplicationsRepository],
})
export class AdminApplicationsModule {}
