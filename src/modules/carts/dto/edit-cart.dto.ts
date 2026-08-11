import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class EditCartDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(10_000)
  quantity!: number;
}
