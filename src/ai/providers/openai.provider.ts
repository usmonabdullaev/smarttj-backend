import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import 'dotenv/config';

import { AskRequest } from '@/ai/dto/requests/ask.request';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class OpenAIProvider {
  private readonly client: OpenAI;

  constructor(private readonly logger: LoggerService) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async ask(dto: AskRequest) {
    const model = dto.model || process.env.OPENAI_DEFAULT_MODEL || 'gpt-5.1';

    try {
      const result = await this.client.responses.create({
        model,
        instructions: dto.context,
        input: dto.prompt,
        temperature: dto.temperature ?? 0.3,
      });

      const text = result.output_text;

      const parsed = JSON.parse(text);

      return {
        text: parsed.text as string,
        confidence: parsed.confidence,
        ok: parsed.ok,
        raw: result,
      };
    } catch (error) {
      this.logger.error('Gemini request failed', {
        error,
        model,
        purpose: dto.purpose,
      });

      throw error;
    }
  }
}
