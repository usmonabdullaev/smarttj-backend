import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdatePartnerProfileDto {
  @ApiPropertyOptional({ example: 'Smart Store' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Интернет-магазин электроники' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Мы продаем оригинальную технику с гарантией',
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

  @ApiPropertyOptional({ example: 'г. Душанбе, ул. Рудаки 10' })
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional({ example: 'ТЦ "Садбарг", 2-й этаж' })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  inn?: string;
}
