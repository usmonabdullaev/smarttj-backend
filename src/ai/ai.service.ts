import { Injectable } from '@nestjs/common';

import { GeminiProvider } from '@/ai/providers/gemini.provider';
import { AIRequestDto } from '@/ai/dto/ai-request.dto';

@Injectable()
export class AIService {
  constructor(private readonly geminiProvider: GeminiProvider) {}

  async ask(input: AIRequestDto) {
    return await this.geminiProvider.ask(input);
  }
}
