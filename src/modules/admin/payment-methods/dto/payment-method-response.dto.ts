import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '@prisma/client';

export class AdminPaymentMethodResponseDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiPropertyOptional({ example: 'ALIF_KORTI_MILLI', nullable: true })
  code?: string | null;

  @ApiProperty({ example: 'Корти милли (Alif)' })
  name!: string;

  @ApiPropertyOptional({ example: 'ALIF', nullable: true })
  provider?: string | null;

  @ApiPropertyOptional({ example: 'https://...', nullable: true })
  icon?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.CARD })
  type!: PaymentMethodType;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({
    example: { orders: 42 },
    description: 'Количество связанных заказов',
  })
  _count?: { orders: number };
}
