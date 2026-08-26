import { Module } from '@nestjs/common';

import { RegionRepository } from '@/common/repositories/region.repository';
import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository, RegionRepository],
})
export class AddressesModule {}
