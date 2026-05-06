import { PartialType } from '@nestjs/swagger';

import { CreateAttributeDto } from '@/modules/attributes/dto/create-attribute.dto';

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {}
