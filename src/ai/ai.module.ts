import { Module } from '@nestjs/common';

import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIService } from './ai.service';

@Module({
  providers: [AIService, OpenAIProvider, GeminiProvider],
  exports: [AIService],
})
export class AIModule {}
