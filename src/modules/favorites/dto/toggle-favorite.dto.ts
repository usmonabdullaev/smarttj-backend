import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ToggleFavoriteDto {
  @ApiProperty({
    description: 'ID товара (UUID)',
    example: '0192e21b-68d1-7000-8000-000000000001',
  })
  @IsNotEmpty()
  @IsUUID('7')
  productId!: string;

  @ApiPropertyOptional({
    description: 'ID конкретного варианта товара (UUID, опционально)',
    example: '0192e21b-68d1-7000-8000-000000000002',
  })
  @IsOptional()
  @IsUUID('7')
  productVariantId?: string;
}
