import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AnalyzeRequestDto {
  @ApiProperty({
    example: 20,
  })
  @IsNumber()
  periodDays: number;
}
