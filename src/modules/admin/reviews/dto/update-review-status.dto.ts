import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReviewStatusDto {
  @ApiProperty({
    enum: ReviewStatus,
    example: ReviewStatus.PUBLISHED,
    description:
      'Новый статус публикации отзыва (PUBLISHED, REJECTED, HIDDEN, PENDING)',
  })
  @IsNotEmpty()
  @IsEnum(ReviewStatus)
  status!: ReviewStatus;
}
