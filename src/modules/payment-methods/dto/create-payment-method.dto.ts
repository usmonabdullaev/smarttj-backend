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
import { PaymentMethodType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentMethodDto {
  @ApiPropertyOptional({
    example: 'ALIF_KORTI_MILLI',
    description: 'Уникальный символьный код метода оплаты',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    example: 'Корти милли (Alif)',
    description: 'Название метода',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'ALIF',
    description: 'Провайдер интеграции: ALIF, CASH, MANUAL',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({
    example: 'https://smarttj.tj/icons/korti_milli.png',
    description: 'URL иконки метода оплаты',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: 'CARD',
    description: 'Тип метода',
    enum: PaymentMethodType,
  })
  @IsString()
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

  @ApiProperty({
    example: true,
    description: 'Активен ли метод оплаты',
  })
  @IsBoolean()
  isActive!: boolean;
}
