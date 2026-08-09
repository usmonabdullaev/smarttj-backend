import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import 'dotenv/config';

import { LoggerService } from '@/logger/logger.service';
import { AIRequestDto } from '@/ai/dto/ai-request.dto';

@Injectable()
export class OpenAIProvider {
  private readonly client: OpenAI;

  constructor(private readonly logger: LoggerService) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async ask(input: AIRequestDto) {
    const model = input.model || process.env.OPENAI_DEFAULT_MODEL || 'gpt-5.1';

    try {
      const result = await this.client.responses.create({
        model,
        instructions: input.context,
        input: input.prompt,
        temperature: input.temperature ?? 0.3,
      });

      const text = result.output_text;

      const parsed = JSON.parse(text);

      return {
        text: parsed.text as string,
        confidense: parsed.confidense,
        ok: parsed.ok,
        raw: result,
      };
    } catch (error) {
      this.logger.error('Gemini request failed', {
        error,
        model,
        purpose: input.purpose,
      });

      throw error;
    }
  }
}
