import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import 'dotenv/config';

import { LoggerService } from '@/logger/logger.service';
import { AIRequestDto } from '@/ai/dto/ai-request.dto';

@Injectable()
export class GroqProvider {
  private readonly client: Groq;

  constructor(private readonly logger: LoggerService) {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async ask(input: AIRequestDto) {
    const model =
      input.model || process.env.GROQ_DEFAULT_MODEL || 'llama-3.1-8b-instant';

    try {
      const result = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: input.context || '',
          },
          {
            role: 'user',
            content: input.prompt,
          },
        ],
        temperature: input.temperature ?? 0.3,
      });

      const text = result.choices[0].message.content || '{}';

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
