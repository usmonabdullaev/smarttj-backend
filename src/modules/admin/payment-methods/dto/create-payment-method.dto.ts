import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCreatePaymentMethodDto {
  @ApiProperty({
    example: 'ALIF_KORTI_MILLI',
    description: 'Уникальный символьный код метода оплаты',
  })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({
    example: 'Корти милли (Alif)',
    description: 'Название способа оплаты для отображения покупателям',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'ALIF',
    description: 'Провайдер эквайринга (ALIF, CASH, MANUAL и т.д.)',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/dqklcu4jy/image/upload/v1/cards/kortimilli.svg',
    description: 'Ссылка на иконку способа оплаты',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    enum: PaymentMethodType,
    example: PaymentMethodType.CARD,
    description: 'Тип метода оплаты: CASH, CARD, WALLET',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  type!: PaymentMethodType;

  @ApiPropertyOptional({
    example: 1.0,
    default: 0,
    description: 'Процент комиссии эквайринга/шлюза (%)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number = 0;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Активен ли способ оплаты при оформлении заказа',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
