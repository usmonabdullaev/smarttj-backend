import { Injectable } from '@nestjs/common';

import { AskRequest, AskRequestProvider } from '@/ai/dto/requests/ask.request';
import { GeminiProvider } from '@/ai/providers/gemini.provider';
import { OpenAIProvider } from '@/ai/providers/openai.provider';
import { GroqProvider } from '@/ai/providers/groq.provider';

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
