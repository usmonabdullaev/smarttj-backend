import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemDeliveryStatus } from '@prisma/client';

import { PayoutOperationStatus } from './get-partner-operations.dto';

export class PartnerOperationItemDto {
  @ApiProperty({
    example: '0191e4b3-764a-7182-93cb-5690b2b8da45',
    description: 'Идентификатор позиции заказа',
  })
  id!: string;

  @ApiProperty({
    example: '0191e4b3-764a-7182-93cb-5690b2b8da45',
    description: 'Идентификатор заказа',
  })
  orderId!: string;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  orderCreatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-12T10:05:00.000Z', nullable: true })
  orderPaidAt?: Date | null;

  @ApiProperty({ example: 'Ноутбук ASUS ROG Strix' })
  productTitle!: string;

  @ApiPropertyOptional({ example: 'ROG-G16-16GB', nullable: true })
  productSku?: string | null;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: 14500, description: 'Цена за единицу' })
  unitPrice!: number;

  @ApiProperty({ example: 14500, description: 'Общая сумма заказа покупателя' })
  totalAmount!: number;

  @ApiProperty({ example: 5.0, description: 'Ставка комиссии площадки (%)' })
  commissionRate!: number;

  @ApiProperty({ example: 725, description: 'Удержанная комиссия площадки' })
  commissionAmount!: number;

  @ApiProperty({ example: 13775, description: 'Чистая сумма выплаты партнёру' })
  payoutAmount!: number;

  @ApiProperty({
    enum: OrderItemDeliveryStatus,
    example: OrderItemDeliveryStatus.RECEIVED,
    description: 'Текущий статус доставки позиции',
  })
  deliveryStatus!: OrderItemDeliveryStatus;

  @ApiProperty({
    enum: PayoutOperationStatus,
    example: PayoutOperationStatus.AVAILABLE,
    description: 'Статус готовности средств к выплате',
  })
  payoutStatus!: PayoutOperationStatus;
}

export class PartnerOperationsPaginationDto {
  @ApiProperty({ example: 120, description: 'Всего операций' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Текущая страница' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Элементов на странице' })
  limit!: number;

  @ApiProperty({ example: 6, description: 'Всего страниц' })
  totalPages!: number;

  @ApiProperty({ example: false, description: 'Есть ли предыдущая страница' })
  hasPrevPage!: boolean;

  @ApiProperty({ example: true, description: 'Есть ли следующая страница' })
  hasNextPage!: boolean;
}

export class PartnerOperationsListResponseDto {
  @ApiProperty({
    type: [PartnerOperationItemDto],
    description: 'Список финансовых операций',
  })
  items!: PartnerOperationItemDto[];

  @ApiProperty({
    type: PartnerOperationsPaginationDto,
    description: 'Пагинация',
  })
  pagination!: PartnerOperationsPaginationDto;
}
