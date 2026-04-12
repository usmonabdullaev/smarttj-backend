import { PaymentMethodType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Наличными' })
  name!: string;

  @ApiProperty({ example: 'CASH', enum: PaymentMethodType })
  type!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-08T07:34:35.160Z' })
  updatedAt!: string;
}
