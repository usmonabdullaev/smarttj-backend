import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

import { AIRequestDto } from '../dto/ai-request.dto';
import { parseAIResponse } from '../utils/parse-ai-response';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class GeminiProvider {
  private readonly client: GoogleGenAI;

  constructor(private readonly logger: LoggerService) {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });
  }

  async ask(input: AIRequestDto) {
    const model =
      input.model ||
      process.env.GEMINI_DEFAULT_MODEL ||
      'gemini-3-flash-preview';

    try {
      const prompt = this.buildPrompt(input);

      const result = await this.client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          temperature: input.temperature ?? 0.3,
        },
      });

      const text =
        result.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ??
        '';

      const parsed = parseAIResponse(text);

      return {
        text: parsed.text,
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

  private buildPrompt(input: AIRequestDto) {
    if (!input.context) {
      return input.prompt;
    }

    return `${input.context}\n\nUser:\n${input.prompt}`;
  }
}
