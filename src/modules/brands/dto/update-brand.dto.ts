import { PartialType } from '@nestjs/swagger';

import { CreateBrandDto } from '@/modules/brands/dto/create-brand.dto';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
