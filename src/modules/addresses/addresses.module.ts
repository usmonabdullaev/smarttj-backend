import { Module } from '@nestjs/common';

import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { RegionRepository } from '@/common/repositories';
import { AddressesService } from './addresses.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository, RegionRepository],
})
export class AddressesModule {}
