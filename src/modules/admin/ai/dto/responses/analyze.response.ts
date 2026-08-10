import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeResponseDto {
  @ApiProperty({
    example: 'AI response',
    description: 'AI analyze response',
  })
  text!: string;
}
