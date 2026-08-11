import { TransactionStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { AnalyzeRequestDto } from '@/modules/admin/ai/dto/requests/analyze.request';
import { AskRequestProvider } from '@/ai/dto/requests/ask.request';
import { AskRequestPurpose } from '@/ai/dto/requests/ask.request';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ANALYTICS_PROMPT } from '@/ai/prompts/analytics.prompt';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class AdminAIService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
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
      provider: AskRequestProvider.GROQ,
    });

    return { text: aiResult.text };
  }

  private async getStats(from: Date, to: Date) {
    const orders = await this.prisma.order.count({
      where: {
        createdAt: { gte: from, lt: to },
      },
    });

    const revenue = await this.prisma.transaction.aggregate({
      where: {
        createdAt: { gte: from, lt: to },
        status: TransactionStatus.SUCCESS,
      },
      _sum: { amount: true },
    });

    const avgOrder =
      orders > 0
        ? (revenue._sum.amount ? +revenue._sum.amount : 0) / orders
        : 0;

    return {
      orders,
      revenue: revenue._sum.amount ? +revenue._sum.amount : 0,
      avgOrder: Math.round(avgOrder),
    };
  }
}
