import { PartialType } from '@nestjs/swagger';
import { CreateRequest } from './create.request';

export class UpdateRequest extends PartialType(CreateRequest) {}
