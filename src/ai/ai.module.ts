import { Module } from '@nestjs/common';

import { OpenAIProvider } from '@/ai/providers/openai.provider';
import { GeminiProvider } from '@/ai/providers/gemini.provider';
import { GroqProvider } from '@/ai/providers/groq.provider';
import { AIService } from '@/ai/ai.service';

@Module({
  providers: [AIService, OpenAIProvider, GeminiProvider, GroqProvider],
  exports: [AIService],
})
export class AIModule {}
