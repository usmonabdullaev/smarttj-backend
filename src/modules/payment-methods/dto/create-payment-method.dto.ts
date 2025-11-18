import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethodType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentMethodDto {
  @ApiProperty({
    example: 'Наличными',
    description: 'Название метода',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'CASH',
    description: 'Тип метода',
    enum: PaymentMethodType,
  })
  @IsString()
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @IsBoolean()
  isActive: boolean;
}
