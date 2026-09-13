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
    description: 'Номер карты Корти Милли для выплат',
  })
  cardAccount?: string | null;

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
    description: 'Номер банковской карты Корти Милли для выплат',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  cardAccount?: string;

  @ApiPropertyOptional({
    example: 'TERM-ALIF-9988',
    description: 'Идентификатор терминала партнера в Alif',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  alifTerminalId?: string;
}
