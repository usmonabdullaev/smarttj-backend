import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum AdminUpdatablePayoutStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export class UpdatePayoutStatusDto {
  @ApiProperty({
    enum: AdminUpdatablePayoutStatus,
    example: AdminUpdatablePayoutStatus.COMPLETED,
    description:
      'Новый статус заявки: PROCESSING (в обработке), COMPLETED (выплачено), REJECTED (отклонено)',
  })
  @IsEnum(AdminUpdatablePayoutStatus)
  @IsNotEmpty()
  status!: AdminUpdatablePayoutStatus;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Файл чека оплаты (изображение или PDF, обязательно при COMPLETED)',
  })
  @IsOptional()
  file?: any;

  @ApiPropertyOptional({
    example: 'Указан несуществующий расчетный счет',
    description: 'Причина отклонения заявки (обязательно при REJECTED)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rejectReason?: string;
}
