import { AskRequestProvider, AskRequestPurpose } from '@smarttj/core/ai';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  SupportChatStatus,
  SupportMessage,
  SupportMessageRole,
} from '@prisma/client';

import { HttpClientService } from '@/infra/http-client/http-client.service';
import { CreateSupportDto } from '@/modules/support/dto/create-support.dto';
import { SUPPORT_PROMPT, supportParser } from '@/ai/prompts/support.prompt';
import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class SupportService {
  private readonly aiServiceUrl?: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpClient: HttpClientService,
    private readonly config: ConfigService,
  ) {
    this.aiServiceUrl = this.config.get('AI_SERVICE_URL');
  }

  async handleUserMessage(dto: CreateSupportDto, userId: string) {
    const chat = await this.getOrCreateActiveChat(userId);

    await this.prisma.supportMessage.create({
      data: {
        chatId: chat.id,
        role: SupportMessageRole.USER,
        content: dto.message,
      },
    });

    if (chat.status !== SupportChatStatus.AI) {
      return { ok: true };
    }

    if (!this.aiServiceUrl) {
      await this.transferToHuman(chat.id);

      return { ok: true };
    }

    const history = await this.prisma.supportMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const prompt = this.buildPrompt(history.reverse());

    const { data } = await this.httpClient.post<{ data: string }>(
      'ai-service',
      `${this.aiServiceUrl}/ask`,
      {
        purpose: AskRequestPurpose.SUPPORT,
        prompt,
        context: SUPPORT_PROMPT,
        temperature: 0.25,
        provider: AskRequestProvider.GEMINI,
      },
      {
        timeout: 15000,
      },
    );

    const result = supportParser(data);

    await this.prisma.supportMessage.create({
      data: {
        chatId: chat.id,
        role: SupportMessageRole.AI,
        content: result.text,
      },
    });

    if (result.confidence !== undefined && result.confidence <= 0.6) {
      await this.transferToHuman(chat.id);
    }

    return { text: result.text };
  }

  async getChats(userId: string) {
    return await this.prisma.supportChat.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  private async getOrCreateActiveChat(userId: string) {
    const chat = await this.prisma.supportChat.findFirst({
      where: {
        userId,
        status: {
          in: [SupportChatStatus.AI, SupportChatStatus.HUMAN],
        },
      },
    });

    if (chat) return chat;

    return await this.prisma.supportChat.create({
      data: { userId, status: SupportChatStatus.HUMAN },
    });
  }

  private buildPrompt(messages: SupportMessage[]) {
    return messages
      .map((m) => {
        if (m.role === SupportMessageRole.USER) return `User: ${m.content}`;
        if (m.role === SupportMessageRole.AI) return `Assistant: ${m.content}`;
      })
      .join('\n');
  }

  private async transferToHuman(chatId: string) {
    await this.prisma.supportChat.update({
      where: { id: chatId },
      data: { status: SupportChatStatus.HUMAN },
    });
  }
}
