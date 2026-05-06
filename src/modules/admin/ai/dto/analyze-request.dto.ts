import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AnalyzeRequestDto {
  @ApiProperty({
    example: 30,
  })
  @IsNumber()
  periodDays!: number;
}
