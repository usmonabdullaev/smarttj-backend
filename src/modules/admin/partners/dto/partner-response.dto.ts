import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerIdentification, PartnerStatus } from '@prisma/client';

export class AdminPartnerUserResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name!: string;

  @ApiProperty({ example: '+992900000001' })
  phone!: string;

  @ApiProperty({ nullable: true, example: 'partner@smarttj.com' })
  email!: string | null;

  @ApiProperty({ example: 'PARTNER' })
  role!: string;

  @ApiProperty({ nullable: true })
  avatar!: string | null;

  @ApiProperty({ example: true })
  emailVerified!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class AdminPartnerResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  userId!: string;

  @ApiProperty({ example: 'Smart Store' })
  title!: string;

  @ApiProperty({ example: 'Магазин электроники' })
  description!: string;

  @ApiProperty({ enum: PartnerStatus, example: PartnerStatus.ACTIVE })
  status!: PartnerStatus;

  @ApiProperty({
    enum: PartnerIdentification,
    example: PartnerIdentification.MINIMUM,
  })
  identification!: PartnerIdentification;

  @ApiProperty({ example: 0 })
  bonus!: number;

  @ApiProperty({ nullable: true })
  logo!: string | null;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+992900000001' })
  phone1!: string;

  @ApiProperty({ nullable: true })
  phone2!: string | null;

  @ApiProperty({ nullable: true })
  address1!: string | null;

  @ApiProperty({ nullable: true })
  address2!: string | null;

  @ApiProperty({ nullable: true })
  about!: string | null;

  @ApiProperty({ nullable: true })
  inn!: string | null;

  @ApiProperty({ nullable: true })
  alifTerminalId!: string | null;

  @ApiProperty({ nullable: true })
  bankName!: string | null;

  @ApiProperty({ nullable: true })
  bankAccount!: string | null;

  @ApiProperty({ nullable: true })
  bik!: string | null;

  @ApiProperty({ nullable: true })
  cardAccount!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: () => AdminPartnerUserResponseDto })
  user?: AdminPartnerUserResponseDto;

  @ApiPropertyOptional()
  _count?: {
    products?: number;
    orderItems?: number;
  };
}
