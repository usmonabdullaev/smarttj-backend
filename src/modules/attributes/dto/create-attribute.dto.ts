import { AttributeType } from '@prisma/client';

export class CreateAttributeValueDto {
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}

export class CreateAttributeDto {
  name: string;
  slug: string;
  type: AttributeType;
  groupId?: string;
  filterable?: boolean;
  order?: number;
  values: CreateAttributeValueDto[];
}
