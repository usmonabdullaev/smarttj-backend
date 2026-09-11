import { AskRequestProvider, AskRequestPurpose } from '@smarttj/core/ai';
import { TransactionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { HttpClientService } from '@/infra/http-client/http-client.service';
import { TransactionRepository } from '@/common/repositories';
import { OrderRepository } from '@/common/repositories';
import { AnalyzeRequestDto } from './dto';
import {
  ANALYTICS_PROMPT,
  analyticsParser,
} from '@/ai/prompts/analytics.prompt';

@Injectable()
export class AdminAIService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly httpClient: HttpClientService,
    private readonly config: ConfigService,
  ) {
    this.aiServiceUrl = this.config.getOrThrow('AI_SERVICE_URL');
  }

  async analyze(dto: AnalyzeRequestDto) {
    const days = dto.periodDays ?? 30;

    const now = new Date();
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevFrom = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    const [current, previous] = await Promise.all([
      this.getStats(from, now),
      this.getStats(prevFrom, from),
    ]);

    const prompt = `Данные интернет-магазина:

Текущий период (${days} дней):
- Доход: ${current.revenue}
- Заказы: ${current.orders}
- Средний чек: ${current.avgOrder}

Предыдущий период:
- Доход: ${previous.revenue}
- Заказы: ${previous.orders}
- Средний чек: ${previous.avgOrder}

Сделай краткий бизнес-анализ.
`;

    const response = await this.httpClient.post<{ data: string }>(
      'ai-service',
      `${this.aiServiceUrl}/ask`,
      {
        context: ANALYTICS_PROMPT,
        purpose: AskRequestPurpose.ANALYTICS,
        prompt,
        temperature: 0.2,
        provider: AskRequestProvider.GEMINI,
      },
      {
        timeout: 20000,
      },
    );

    const result = analyticsParser(response.data);

    return result;
  }

  private async getStats(from: Date, to: Date) {
    const orders = await this.orderRepository.count({
      createdAt: { gte: from, lt: to },
    });

    const revenue = await this.transactionRepository.aggregate({
      where: {
        createdAt: { gte: from, lt: to },
        status: TransactionStatus.SUCCESS,
      },
      _sum: { amount: true },
    });

    const avgOrder =
      orders > 0
        ? (revenue._sum?.amount ? +revenue._sum.amount : 0) / orders
        : 0;

    return {
      orders,
      revenue: revenue._sum?.amount ? +revenue._sum.amount : 0,
      avgOrder: Math.round(avgOrder),
    };
  }
}
