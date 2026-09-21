import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateProductStatusDto {
  @ApiPropertyOptional({
    enum: ProductStatus,
    example: ProductStatus.INACTIVE,
    description: 'Статус товара (ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: false,
    description: 'Флаг активности товара (true = ACTIVE, false = INACTIVE)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
