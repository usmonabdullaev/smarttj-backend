import { AskRequestProvider, AskRequestPurpose } from '@smarttj/core/ai';
import { TransactionStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { ANALYTICS_PROMPT } from '@/ai/prompts/analytics.prompt';
import { TransactionRepository } from '@/common/repositories';
import { OrderRepository } from '@/common/repositories';
import { AIService } from '@/ai/ai.service';
import { AnalyzeRequestDto } from './dto';

@Injectable()
export class AdminAIService {
  constructor(
    private readonly aiService: AIService,
    private readonly orderRepository: OrderRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

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

    const aiResult = await this.aiService.ask({
      context: ANALYTICS_PROMPT,
      purpose: AskRequestPurpose.ANALYTICS,
      prompt,
      temperature: 0.2,
      provider: AskRequestProvider.GEMINI,
    });

    return { text: aiResult.text };
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
