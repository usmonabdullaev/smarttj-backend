import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReviewStatusDto {
  @ApiProperty({
    enum: ReviewStatus,
    example: ReviewStatus.PUBLISHED,
    description:
      'Новый статус публикации отзыва ("AUTO_MODERATION", "MANUAL_MODERATION", "PUBLISHED", "REJECTED", "HIDDEN")',
  })
  @IsNotEmpty()
  @IsEnum(ReviewStatus)
  status!: ReviewStatus;
}
