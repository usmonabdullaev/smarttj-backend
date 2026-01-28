import { GenerateContentResponse } from '@google/genai';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeResponseDto {
  @ApiProperty({
    example: 'AI response',
  })
  text: string;

  @ApiProperty({
    example: 0.8,
  })
  confidense: number;

  @ApiProperty({
    type: GenerateContentResponse,
  })
  raw: GenerateContentResponse;
}
