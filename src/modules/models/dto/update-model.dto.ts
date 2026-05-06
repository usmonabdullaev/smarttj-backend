import { PartialType } from '@nestjs/swagger';

import { CreateModelDto } from '@/modules/models/dto/create-model.dto';

export class UpdateModelDto extends PartialType(CreateModelDto) {}
