import { ApplicationStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateRequest {
  @ApiProperty({ enum: ApplicationStatus, example: 'COMPLETED' })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
