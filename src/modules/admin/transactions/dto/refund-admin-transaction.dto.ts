import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefundAdminTransactionDto {
  @ApiProperty({
    example: 'Возврат средств по заявке клиента / брак товара',
    description: 'Обязательная причина возврата транзакции',
  })
  @IsNotEmpty({ message: 'Причина возврата обязательна' })
  @IsString()
  @MaxLength(500)
  reason!: string;
}
