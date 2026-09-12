import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType } from '@prisma/client';

export class AttributeGroupResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Память' })
  name!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({
    example: { attributes: 3 },
    description: 'Количество привязанных характеристик',
  })
  _count?: { attributes: number };
}

export class AttributeValueResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  attributeId!: string;

  @ApiPropertyOptional({ example: '128 ГБ', nullable: true })
  valueString?: string | null;

  @ApiPropertyOptional({ example: 128, nullable: true })
  valueNumber?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  valueBoolean?: boolean | null;

  @ApiPropertyOptional({ example: '128 ГБ', nullable: true })
  label?: string | null;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  createdAt!: Date;
}

export class AttributeResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Встроенная память' })
  name!: string;

  @ApiProperty({ enum: AttributeType, example: AttributeType.SELECT })
  type!: AttributeType;

  @ApiPropertyOptional({ example: 'ГБ', nullable: true })
  unit?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  groupId?: string | null;

  @ApiProperty({ example: false })
  required!: boolean;

  @ApiProperty({ example: true })
  filterable!: boolean;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: Object, nullable: true })
  category?: any;

  @ApiPropertyOptional({ type: AttributeGroupResponseDto, nullable: true })
  group?: AttributeGroupResponseDto | null;

  @ApiPropertyOptional({ type: [AttributeValueResponseDto] })
  values?: AttributeValueResponseDto[];

  @ApiPropertyOptional({
    example: { values: 4, ptoductAttributes: 18 },
  })
  _count?: {
    values?: number;
    ptoductAttributes?: number;
  };
}
