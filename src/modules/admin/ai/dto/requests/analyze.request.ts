import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class AnalyzeRequestDto {
  @ApiProperty({
    example: 30,
    description: 'Analyze business in period days with AI',
    minimum: 1,
    maximum: 1000,
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  periodDays!: number;
}
