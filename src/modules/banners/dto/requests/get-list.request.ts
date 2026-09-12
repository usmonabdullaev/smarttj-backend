import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { BannerPosition } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

@ApiSchema({ name: 'BannersGetListRequest' })
export class GetListRequest {
  @ApiPropertyOptional({
    enum: BannerPosition,
    example: 'MAIN',
    default: 'MAIN',
  })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;
}
