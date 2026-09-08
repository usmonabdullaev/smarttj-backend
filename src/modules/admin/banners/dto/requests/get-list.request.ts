import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { BannerPosition } from '@prisma/client';
import { IsEnum } from 'class-validator';

@ApiSchema({ name: 'AdminBannersGetListRequest' })
export class GetListRequest {
  @ApiProperty({ enum: BannerPosition, example: 'MAIN' })
  @IsEnum(BannerPosition)
  position!: BannerPosition;
}
