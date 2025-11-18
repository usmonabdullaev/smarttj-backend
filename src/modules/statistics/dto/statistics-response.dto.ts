import { ApiProperty } from '@nestjs/swagger';

export class StatisticsResponseDto {
  @ApiProperty({ example: 1000 })
  currentIncome: number;

  @ApiProperty({ example: 1000 })
  previousIncome: number;

  @ApiProperty({ example: 1000 })
  difference: number;

  @ApiProperty({ example: 1000 })
  growth: number;
}
