import { NotificationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GetOneResponse {
  @ApiProperty({
    example: '019ff2ab-22a8-1234-8b4c-5ab0f3f525fc',
    uniqueItems: true,
  })
  id!: string;

  @ApiProperty({
    example: '019ff2ab-22a8-769a-8b4c-5ab0f3f525fc',
  })
  userId!: string;

  @ApiProperty({
    example: 'DEFAULT',
    enum: NotificationType,
    default: 'DEFAULT',
  })
  type!: NotificationType;

  @ApiProperty({
    example: 'Notification title',
  })
  title!: string;

  @ApiProperty({
    example: 'Notification message',
  })
  message!: string;

  @ApiProperty({
    example: false,
    default: false,
  })
  isRead!: boolean;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  metadata!: {
    [key: string]: string | number | boolean;
  } | null;

  @ApiProperty({
    example: '2026-08-08T14:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-08-08T14:00:00.000Z',
  })
  updatedAt!: string;
}
