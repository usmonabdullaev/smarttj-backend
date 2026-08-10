import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

import { AskRequest } from '@/ai/dto/requests/ask.request';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class GeminiProvider {
  private readonly client: GoogleGenAI;

  constructor(private readonly logger: LoggerService) {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async ask(dto: AskRequest) {
    const model =
      dto.model || process.env.GEMINI_DEFAULT_MODEL || 'gemini-3-flash-preview';

    try {
      const result = await this.client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: dto.prompt }],
          },
        ],
        config: {
          temperature: dto.temperature ?? 0.3,
          systemInstruction: dto.context,
        },
      });

      const text =
        result.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ??
        '';

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
