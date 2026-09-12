import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PartnerIdentification, PartnerStatus } from '@prisma/client';

export class AdminGetPartnersDto {
  @ApiPropertyOptional({ example: 1, description: 'Номер страницы' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Количество записей на страницу',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'Smart',
    description:
      'Поисковый запрос (по названию магазина, телефону, email, ИНН, имени владельца)',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
    description: 'Фильтр по статусу партнёра',
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @ApiPropertyOptional({
    enum: PartnerIdentification,
    example: PartnerIdentification.MINIMUM,
    description: 'Фильтр по уровню идентификации',
  })
  @IsOptional()
  @IsEnum(PartnerIdentification)
  identification?: PartnerIdentification;
}
