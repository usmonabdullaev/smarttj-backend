import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateVariantStockDto {
  @ApiProperty({
    example: 15,
    description: 'Новый остаток товара на складе (>= 0)',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  stock!: number;
}
