import { AskRequest, AskResponse } from '@smarttj/core';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import type { HttpRequestOptions } from '@nestjs/http-client';

import { HttpClientService } from '@/infra/http-client/http-client.service';

@Injectable()
export class AIService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly httpClient: HttpClientService,
  ) {
    this.aiServiceUrl = this.config.getOrThrow('AI_SERVICE_URL');
  }

  async ask(data: AskRequest, config?: HttpRequestOptions) {
    return await this.httpClient.post<AskResponse>(
      'smarttj-ai',
      `${this.aiServiceUrl}/ask`,
      data,
      config,
    );
  }
}
