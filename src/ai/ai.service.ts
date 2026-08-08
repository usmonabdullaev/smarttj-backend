import { Injectable } from '@nestjs/common';

import { GeminiProvider } from '@/ai/providers/gemini.provider';
import { OpenAIProvider } from '@/ai/providers/openai.provider';
import { AIResponseDto } from '@/ai/dto/ai-response.dto';
import { AIRequestDto } from '@/ai/dto/ai-request.dto';
import { ProvidersEnum } from '@/ai/dto/providers.dto';

@Injectable()
export class AIService {
  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly openaiProvider: OpenAIProvider,
  ) {}

  async ask(
    input: AIRequestDto,
    provider?: ProvidersEnum,
  ): Promise<AIResponseDto> {
    switch (provider) {
      case ProvidersEnum.OPENAI:
        return await this.openaiProvider.ask(input);

      case ProvidersEnum.GEMINI:
        return await this.geminiProvider.ask(input);

      default:
        return await this.geminiProvider.ask(input);
    }
  }
}
