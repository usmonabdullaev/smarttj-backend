import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { PartnerRepository, UserRepository } from '@/common/repositories';
import { PartnerProfileController } from './profile.controller';
import { PartnerProfileService } from './profile.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [PartnerProfileController],
  providers: [PartnerProfileService, PartnerRepository, UserRepository],
  exports: [PartnerProfileService],
})
export class PartnerProfileModule {}
