import { Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  SupportChatStatus,
  SupportMessage,
  SupportMessageRole,
} from '@prisma/client';

import {
  CreateSupportDto,
  SendMessageDto,
} from '@/modules/support/dto/create-support.dto';
import {
  AskRequestProvider,
  AskRequestPurpose,
} from '@/ai/dto/requests/ask.request';
import { PrismaService } from '@/database/prisma/prisma.service';
import { SUPPORT_PROMPT } from '@/ai/prompts/support.prompt';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class SupportService {
  private readonly events$ = new Subject<MessageEvent>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  getEvents() {
    return this.events$.asObservable();
  }

  emit(event: MessageEvent) {
    this.events$.next(event);
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

    const history = await this.prisma.supportMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const prompt = this.buildPrompt(history.reverse());

    const aiResponse = await this.aiService.ask({
      purpose: AskRequestPurpose.SUPPORT,
      prompt,
      context: SUPPORT_PROMPT,
      temperature: 0.25,
      provider: AskRequestProvider.GEMINI,
      model: 'gemini-3.5-flash-lite',
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

  async sendMessage(dto: SendMessageDto) {
    const chat = await this.prisma.supportChat.findFirst({
      where: {
        id: dto.chatId,
        status: SupportChatStatus.HUMAN,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or closed or not for human');
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        chatId: dto.chatId,
        role: SupportMessageRole.OPERATOR,
        content: dto.message,
      },
    });

    this.emit({ data: message } as any);

    return message;
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
