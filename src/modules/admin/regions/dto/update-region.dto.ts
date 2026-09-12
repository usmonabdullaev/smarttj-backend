import { PartialType } from '@nestjs/swagger';
import { AdminCreateRegionDto } from './create-region.dto';

export class AdminUpdateRegionDto extends PartialType(AdminCreateRegionDto) {}
