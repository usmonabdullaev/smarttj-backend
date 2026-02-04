import { OrderType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(OrderType)
  type: OrderType;

  @IsUUID()
  paymentMethodId: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
