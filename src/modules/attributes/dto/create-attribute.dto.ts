import { AttributeType } from '@prisma/client';

export class CreateAttributeValueDto {
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  label?: string;
}

export class CreateAttributeDto {
  categoryId?: string;
  name!: string;
  type!: AttributeType;
  unit?: string;
  groupId?: string;
  required?: boolean;
  filterable?: boolean;
  order?: number;
  values?: CreateAttributeValueDto[];
}
