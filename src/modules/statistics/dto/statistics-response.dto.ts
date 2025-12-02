import { ApiProperty } from '@nestjs/swagger';

export class StatisticsResponseDto {
  @ApiProperty({
    example: {
      growth: 100,
      difference: 10000,
      total: 100000,
      lastMonth: 30000,
    },
  })
  income: any;

  @ApiProperty({
    example: {
      growth: 100,
      difference: 10000,
      total: 100000,
      lastMonth: 30000,
      today: 500,
    },
  })
  order: any;
}
