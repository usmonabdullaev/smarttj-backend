import { Injectable } from '@nestjs/common';

import { GeminiProvider } from '@/ai/providers/gemini.provider';
import { OpenAIProvider } from '@/ai/providers/openai.provider';
import { GroqProvider } from '@/ai/providers/groq.provider';
import { AskRequest, AskRequestProvider } from './dto';

@Injectable()
export class AIService {
  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly openaiProvider: OpenAIProvider,
    private readonly groqProvider: GroqProvider,
  ) {}

  async ask(dto: AskRequest) {
    switch (dto.provider) {
      case AskRequestProvider.OPENAI:
        return await this.openaiProvider.ask(dto);

      case AskRequestProvider.GEMINI:
        return await this.geminiProvider.ask(dto);

      case AskRequestProvider.GROQ:
        return await this.groqProvider.ask(dto);

      default:
        return await this.geminiProvider.ask(dto);
    }
  }
}
