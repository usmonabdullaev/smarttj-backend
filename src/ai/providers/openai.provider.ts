import { Injectable } from '@nestjs/common';

import { AIRequestDto } from '@/ai/dto/ai-request.dto';

@Injectable()
export class OpenAIProvider {
  ask(input: AIRequestDto) {
    return input;
  }
}
