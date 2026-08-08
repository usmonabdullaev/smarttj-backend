import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

import { LoggerService } from '@/logger/logger.service';
import { AIRequestDto } from '@/ai/dto/ai-request.dto';

@Injectable()
export class GeminiProvider {
  private readonly client: GoogleGenAI;

  constructor(private readonly logger: LoggerService) {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async ask(input: AIRequestDto) {
    const model =
      input.model ||
      process.env.GEMINI_DEFAULT_MODEL ||
      'gemini-3-flash-preview';

    try {
      const result = await this.client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: input.prompt }],
          },
        ],
        config: {
          temperature: input.temperature ?? 0.3,
          systemInstruction: input.context,
        },
      });

      const text =
        result.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ??
        '';

      const parsed = JSON.parse(text);

      return {
        text: parsed.text as string,
        confidense: parsed.confidense,
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
