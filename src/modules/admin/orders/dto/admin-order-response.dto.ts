import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderDeliveryStatus,
  OrderItemDeliveryStatus,
  OrderPaymentStatus,
  OrderType,
  OrderUIStatus,
} from '@prisma/client';

export class AdminOrderUserDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name!: string;

  @ApiProperty({ example: '992900000000' })
  phone!: string;

  @ApiPropertyOptional({ example: 'ivan@example.com', nullable: true })
  email?: string | null;
}

export class AdminOrderItemDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  orderId!: string;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  productVariantId?: string | null;

  @ApiPropertyOptional({
    example: '019a6263-6f97-7230-8449-e979b855ada1',
    nullable: true,
  })
  partnerId?: string | null;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: 2500, description: 'Цена за единицу (сомони)' })
  price!: number;

  @ApiProperty({
    enum: OrderItemDeliveryStatus,
    example: OrderItemDeliveryStatus.NEW,
  })
  deliveryStatus!: OrderItemDeliveryStatus;

  @ApiPropertyOptional({ example: 'Apple iPhone 16 Pro 256GB' })
  productTitle?: string | null;

  @ApiPropertyOptional({ example: 'https://...' })
  productImage?: string | null;

  @ApiPropertyOptional({ example: 'SKU-12345' })
  productSku?: string | null;

  @ApiPropertyOptional({ type: Object })
  partner?: any;

  @ApiPropertyOptional({ type: Object })
  productVariant?: any;
}

export class AdminOrderDto {
  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  id!: string;

  @ApiProperty({ example: '019a6263-6f97-7230-8449-e979b855ada1' })
  userId!: string;

  @ApiProperty({ enum: OrderPaymentStatus, example: OrderPaymentStatus.PAID })
  paymentStatus!: OrderPaymentStatus;

  @ApiProperty({
    enum: OrderDeliveryStatus,
    example: OrderDeliveryStatus.DELIVERED,
  })
  deliveryStatus!: OrderDeliveryStatus;

  @ApiProperty({ enum: OrderUIStatus, example: OrderUIStatus.SHOW })
  uiStatus!: OrderUIStatus;

  @ApiProperty({ enum: OrderType, example: OrderType.DELIVERY })
  type!: OrderType;

  @ApiProperty({ example: 5000, description: 'Итоговая сумма (сомони)' })
  totalPrice!: number;

  @ApiPropertyOptional({ example: 'Оставить у двери', nullable: true })
  comment?: string | null;

  @ApiPropertyOptional({ example: '2026-09-12T12:00:00.000Z', nullable: true })
  paidAt?: Date | null;

  @ApiPropertyOptional({ example: 'Отменен клиентом', nullable: true })
  cancelReason?: string | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: AdminOrderUserDto })
  user!: AdminOrderUserDto;

  @ApiPropertyOptional({ type: Object })
  paymentMethod?: any;

  @ApiPropertyOptional({ type: Object })
  address?: any;

  @ApiPropertyOptional({ type: [AdminOrderItemDto] })
  items?: AdminOrderItemDto[];
}

export class AdminOrderListMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 142 })
  total!: number;

  @ApiProperty({ example: 15 })
  totalPages!: number;
}

export class AdminOrderListResponseDto {
  @ApiProperty({ type: [AdminOrderDto] })
  data!: AdminOrderDto[];

  @ApiProperty({ type: AdminOrderListMetaDto })
  meta!: AdminOrderListMetaDto;
}
