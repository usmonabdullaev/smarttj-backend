import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PartnerIdentification, PartnerStatus } from '@prisma/client';

export class AdminUpdatePartnerStatusDto {
  @ApiProperty({
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
    description: 'Новый статус партнёра',
  })
  @IsEnum(PartnerStatus)
  @IsNotEmpty()
  status!: PartnerStatus;
}

export class AdminUpdatePartnerDto {
  @ApiPropertyOptional({
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
    description: 'Статус партнёра',
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @ApiPropertyOptional({
    enum: PartnerIdentification,
    example: PartnerIdentification.STANDART,
    description: 'Уровень идентификации',
  })
  @IsOptional()
  @IsEnum(PartnerIdentification)
  identification?: PartnerIdentification;

  @ApiPropertyOptional({ example: 0, description: 'Бонусный баланс' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bonus?: number;

  @ApiPropertyOptional({
    example: 'Smart Store',
    description: 'Название магазина',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Магазин оригинальной электроники',
    description: 'Краткое описание',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'О компании...',
    description: 'Подробное описание',
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: 'partner@smarttj.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+992900000001' })
  @IsOptional()
  @IsString()
  phone1?: string;

  @ApiPropertyOptional({ example: '+992900000002' })
  @IsOptional()
  @IsString()
  phone2?: string;

  @ApiPropertyOptional({ example: 'г. Душанбе, пр. Рудаки 10' })
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional({ example: 'ТЦ "Садбарг", 2 этаж' })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'ИНН партнёра' })
  @IsOptional()
  @IsString()
  inn?: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'ID терминала партнера в Alif (Alif Marketplace)',
  })
  @IsOptional()
  @IsString()
  alifTerminalId?: string;

  @ApiPropertyOptional({ example: 'Alif Bank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: 'TJ12ALIF0000000012345678' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ example: '350101123' })
  @IsOptional()
  @IsString()
  bik?: string;

  @ApiPropertyOptional({ example: '992000000000' })
  @IsOptional()
  @IsString()
  cardAccount?: string;
}
