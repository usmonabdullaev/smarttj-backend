import { Injectable } from '@nestjs/common';

import { AIRequestDto } from './dto/ai-request.dto';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AIService {
  constructor(private readonly geminiProvider: GeminiProvider) {}

  async ask(input: AIRequestDto) {
    return await this.geminiProvider.ask(input);
  }
}
