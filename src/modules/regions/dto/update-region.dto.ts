import { PartialType } from '@nestjs/swagger';

import { CreateRegionDto } from '@/modules/regions/dto/create-region.dto';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
