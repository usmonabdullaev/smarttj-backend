import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsUUID(7)
  userId!: string;

  @ApiProperty({
    example: 'DEFAULT',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    example: 'title',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'message',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    [key: string]: any;
  };
}
