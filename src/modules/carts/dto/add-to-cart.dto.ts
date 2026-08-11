import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'ID' })
  @IsUUID(7)
  productVariantId!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  quantity?: number;
}
