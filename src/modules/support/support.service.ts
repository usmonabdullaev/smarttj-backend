import { Injectable } from '@nestjs/common';
import {
  SupportChatStatus,
  SupportMessage,
  SupportMessageRole,
} from '@prisma/client';

import { CreateSupportDto } from '@/modules/support/dto/create-support.dto';
import { AskRequestPurpose } from '@/ai/dto/requests/ask.request';
import { PrismaService } from '@/database/prisma/prisma.service';
import { SUPPORT_PROMPT } from '@/ai/prompts/support.prompt';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

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
      return;
    }

    const history = await this.prisma.supportMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const prompt = this.buildPrompt(history);

    const aiResponse = await this.aiService.ask({
      purpose: AskRequestPurpose.SUPPORT,
      prompt,
      context: SUPPORT_PROMPT,
      temperature: 0.25,
    });

    await this.prisma.supportMessage.create({
      data: {
        chatId: chat.id,
        role: SupportMessageRole.AI,
        content: aiResponse.text,
      },
    });

    if (aiResponse.confidence !== undefined && aiResponse.confidence <= 0.6) {
      await this.transferToHuman(chat.id);
    }

    return { text: aiResponse.text };
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
      data: { userId, status: SupportChatStatus.AI },
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
