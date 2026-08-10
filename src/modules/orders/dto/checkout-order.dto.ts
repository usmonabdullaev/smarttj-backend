import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutOrderDto {
  @ApiProperty({
    enum: OrderType,
    example: OrderType.DELIVERY,
  })
  @IsEnum(OrderType)
  type!: OrderType;

  @ApiProperty({
    example: 'ID',
  })
  @IsUUID(7)
  paymentMethodId!: string;

  @ApiPropertyOptional({
    example: 'ID',
  })
  @IsOptional()
  @IsUUID(7)
  shopId?: string;

  @ApiPropertyOptional({
    example: 'ID',
  })
  @IsOptional()
  @IsUUID(7)
  addressId?: string;

  @ApiPropertyOptional({
    example: 'Comment',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
