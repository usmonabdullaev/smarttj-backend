import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class CardsService {
  private readonly logger = new LoggerService(CardsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить список сохраненных активных карт пользователя
   */
  async getCards(userId: string) {
    return await this.prisma.savedCard.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        cardMask: true,
        cardType: true,
        bankName: true,
        expireDate: true,
        isDefault: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Сделать карту основной по умолчанию
   */
  async setDefaultCard(cardId: string, userId: string) {
    const card = await this.prisma.savedCard.findFirst({
      where: {
        id: cardId,
        userId,
        isActive: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена или неактивна');
    }

    if (card.isDefault) {
      return card;
    }

    // Сбрасываем флаг isDefault у всех остальных карт и включаем для выбранной
    return await this.prisma.$transaction(async (tx) => {
      await tx.savedCard.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      return await tx.savedCard.update({
        where: { id: cardId },
        data: { isDefault: true },
        select: {
          id: true,
          cardMask: true,
          cardType: true,
          bankName: true,
          expireDate: true,
          isDefault: true,
          isActive: true,
          createdAt: true,
        },
      });
    });
  }

  /**
   * Удалить / отвязать сохраненную карту
   */
  async deleteCard(cardId: string, userId: string) {
    const card = await this.prisma.savedCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена');
    }

    // Мягкое удаление (деактивация) для сохранения целостности истории платежей
    await this.prisma.$transaction(async (tx) => {
      await tx.savedCard.update({
        where: { id: cardId },
        data: {
          isActive: false,
          isDefault: false,
        },
      });

      // Если удаляемая карта была дефолтной, делаем следующую активную дефолтной
      if (card.isDefault) {
        const nextActive = await tx.savedCard.findFirst({
          where: {
            userId,
            isActive: true,
            id: { not: cardId },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (nextActive) {
          await tx.savedCard.update({
            where: { id: nextActive.id },
            data: { isDefault: true },
          });
        }
      }
    });

    this.logger.log(`Card ${cardId} deactivated by user ${userId}`);

    return {
      success: true,
      message: 'Карта успешно удалена',
    };
  }
}
