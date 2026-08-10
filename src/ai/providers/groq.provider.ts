import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import 'dotenv/config';

import { AskRequest } from '@/ai/dto/requests/ask.request';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class GroqProvider {
  private readonly client: Groq;

  constructor(private readonly logger: LoggerService) {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async ask(dto: AskRequest) {
    const model =
      dto.model || process.env.GROQ_DEFAULT_MODEL || 'llama-3.1-8b-instant';

    try {
      const result = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: dto.context || '',
          },
          {
            role: 'user',
            content: dto.prompt,
          },
        ],
        temperature: dto.temperature ?? 0.3,
      });

      const text = result.choices[0].message.content || '{}';

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
