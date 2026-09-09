import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';

import { LoggerService } from '@/logger/logger.service';

interface MemoryCodeItem {
  userId: string;
  partnerId: string;
  expiresAt: number;
}

@Injectable()
export class TelegramCodeStore implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new LoggerService(TelegramCodeStore.name);
  private redisClient: Redis | null = null;
  private readonly memoryStore = new Map<string, MemoryCodeItem>();

  onModuleInit() {
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT) || 6379;

    if (host) {
      try {
        this.redisClient = new Redis({
          host,
          port,
          lazyConnect: true,
          maxRetriesPerRequest: 2,
        });

        this.redisClient.connect().catch((err) => {
          this.logger.warn(
            `Redis connection failed for TelegramCodeStore, fallback to memory: ${err.message}`,
          );
          this.redisClient = null;
        });
      } catch (e: any) {
        this.logger.warn(`Could not initialize Redis client: ${e.message}`);
        this.redisClient = null;
      }
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
    this.memoryStore.clear();
  }

  /**
   * Сгенерировать удобный 6-значный буквенно-цифровой код связывания
   */
  generateCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(6);
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Сохранить код связывания для пользователя/партнёра
   */
  async setLinkCode(
    code: string,
    payload: { userId: string; partnerId: string },
    ttlSeconds: number = 900,
  ): Promise<void> {
    const normalizedCode = code.toUpperCase().trim();
    const dataString = JSON.stringify(payload);

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.set(
          `tg_link:${normalizedCode}`,
          dataString,
          'EX',
          ttlSeconds,
        );
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set error, using memory: ${err.message}`);
      }
    }

    // In-memory fallback
    this.memoryStore.set(normalizedCode, {
      ...payload,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Получить и удалить код связывания (одноразовый)
   */
  async consumeLinkCode(
    code: string,
  ): Promise<{ userId: string; partnerId: string } | null> {
    let rawCode = code.trim();
    if (rawCode.toLowerCase().startsWith('link_')) {
      rawCode = rawCode.substring(5);
    }
    const normalizedCode = rawCode.toUpperCase().trim();

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const val = await this.redisClient.get(`tg_link:${normalizedCode}`);
        if (val) {
          await this.redisClient.del(`tg_link:${normalizedCode}`);
          return JSON.parse(val);
        }
      } catch (err: any) {
        this.logger.warn(`Redis get error, checking memory: ${err.message}`);
      }
    }

    // Memory check
    const item = this.memoryStore.get(normalizedCode);
    if (!item) return null;

    if (item.expiresAt < Date.now()) {
      this.memoryStore.delete(normalizedCode);
      return null;
    }

    this.memoryStore.delete(normalizedCode);
    return { userId: item.userId, partnerId: item.partnerId };
  }
}
