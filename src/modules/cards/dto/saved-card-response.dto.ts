import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SavedCardResponseDto {
  @ApiProperty({
    example: '018f26a1-7c9b-7345-8123-abcdef123456',
    description: 'Уникальный ID сохраненной карты',
  })
  id!: string;

  @ApiProperty({
    example: '444455******1111',
    description: 'Маскированный номер карты или телефона кошелька',
  })
  cardMask!: string;

  @ApiPropertyOptional({
    example: 'korti_milli',
    description: 'Тип карты: korti_milli, visa, mastercard, wallet',
    nullable: true,
  })
  cardType?: string | null;

  @ApiPropertyOptional({
    example: 'Alif Bank',
    description: 'Банк-эмитент карты',
    nullable: true,
  })
  bankName?: string | null;

  @ApiPropertyOptional({
    example: '12/28',
    description: 'Срок действия карты (MM/YY)',
    nullable: true,
  })
  expireDate?: string | null;

  @ApiProperty({
    example: true,
    description: 'Основная карта по умолчанию для списаний',
  })
  isDefault!: boolean;

  @ApiProperty({
    example: true,
    description: 'Активна ли карта',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-09-21T23:00:00.000Z',
    description: 'Дата привязки карты',
  })
  createdAt!: Date;
}
