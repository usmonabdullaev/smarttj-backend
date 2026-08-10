import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({
    example: 'iphone',
    type: 'string',
  })
  @IsString()
  @MinLength(3)
  q!: string;
}
