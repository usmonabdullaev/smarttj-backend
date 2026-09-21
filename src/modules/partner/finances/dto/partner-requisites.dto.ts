import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PartnerRequisitesResponseDto {
  @ApiPropertyOptional({
    example: '123456789',
    nullable: true,
    description: 'ИНН',
  })
  inn?: string | null;

  @ApiPropertyOptional({
    example: 'ОАО «Ориёнбанк»',
    nullable: true,
    description: 'Наименование банка',
  })
  bankName?: string | null;

  @ApiPropertyOptional({
    example: 'TJ24IBAN1234567890123456',
    nullable: true,
    description: 'Расчетный счет (IBAN)',
  })
  bankAccount?: string | null;

  @ApiPropertyOptional({
    example: '350101123',
    nullable: true,
    description: 'БИК / МФО банка',
  })
  bik?: string | null;

  @ApiPropertyOptional({
    example: '9771000012345678',
    nullable: true,
    description: 'Номер карты Корти Милли / Visa / Mastercard для выплат',
  })
  cardAccount?: string | null;

  @ApiPropertyOptional({
    example: 'Рахимов Алишер',
    nullable: true,
    description: 'ФИО владельца карты (для сверки перед переводом)',
  })
  cardHolder?: string | null;

  @ApiPropertyOptional({
    example: 'Alif Bank',
    nullable: true,
    description: 'Банк карты для выплат',
  })
  cardBank?: string | null;

  @ApiPropertyOptional({
    example: '+992900112233',
    nullable: true,
    description: 'Номер телефона для перевода (Alif mobi / DC Next)',
  })
  payoutPhone?: string | null;

  @ApiPropertyOptional({
    example: 'TERM-ALIF-9988',
    nullable: true,
    description: 'ID терминала в Alif Marketplace',
  })
  alifTerminalId?: string | null;

  @ApiProperty({ example: true, description: 'Заполнены ли реквизиты' })
  isComplete!: boolean;
}

export class UpdatePartnerRequisitesDto {
  @ApiPropertyOptional({
    example: '123456789',
    description: 'ИНН организации или индивидуального предпринимателя',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  inn?: string;

  @ApiPropertyOptional({
    example: 'ОАО «Ориёнбанк»',
    description: 'Наименование банка партнера',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;

  @ApiPropertyOptional({
    example: 'TJ24IBAN1234567890123456',
    description: 'Расчетный счет (IBAN) партнера',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  bankAccount?: string;

  @ApiPropertyOptional({
    example: '350101123',
    description: 'БИК / МФО банка',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bik?: string;

  @ApiPropertyOptional({
    example: '9771000012345678',
    description: 'Номер банковской карты Корти Милли / Visa для выплат',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  cardAccount?: string;

  @ApiPropertyOptional({
    example: 'Рахимов Алишер',
    description: 'ФИО владельца карты (для сверки получателя)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cardHolder?: string;

  @ApiPropertyOptional({
    example: 'Alif Bank',
    description: 'Банк карты для выплат (Alif, Dushanbe City, Eskhata и др.)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cardBank?: string;

  @ApiPropertyOptional({
    example: '+992900112233',
    description: 'Номер телефона для перевода (Alif mobi / DC Next)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  payoutPhone?: string;

  @ApiPropertyOptional({
    example: 'TERM-ALIF-9988',
    description: 'Идентификатор терминала партнера в Alif',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  alifTerminalId?: string;
}
