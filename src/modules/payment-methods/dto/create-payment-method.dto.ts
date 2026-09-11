import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
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

  @ApiProperty({
    example: true,
    description: 'Активен ли метод оплаты',
  })
  @IsBoolean()
  isActive!: boolean;
}
