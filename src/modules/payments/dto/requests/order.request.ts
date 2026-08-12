import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class OrderRequest {
  @ApiProperty({ example: 'ID' })
  @IsUUID(7)
  orderId!: string;
}
