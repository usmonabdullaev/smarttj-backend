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
    example: 'П/П №10492 от 13.09.2026',
    description:
      'Номер платёжного поручения или транзакции банка (обязательно при COMPLETED)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  transactionReference?: string;

  @ApiPropertyOptional({
    example: 'Указан несуществующий расчетный счет',
    description: 'Причина отклонения заявки (обязательно при REJECTED)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rejectReason?: string;
}
