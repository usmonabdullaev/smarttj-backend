import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoggerService } from '@/logger/logger.service';
import { SMS_CONSTANTS } from '../constants/sms.constants';
import { SmsPriority, SmsType } from '../enums';
import {
  ISmsProvider,
  SendSingleSmsOptions,
} from '../interfaces/sms-provider.interface';
import {
  SmsGateBulkResponse,
  SmsGateSendResponse,
  SmsGateSinglePayload,
  SmsGateStatusResponse,
} from '../interfaces/smsgate.interface';
import { PhoneFormatter } from '../utils/phone-formatter.util';
import { SmsgateRequest } from '../dto/requests/smsgate.request';
import { SmsgateResponse } from '../dto/responses/smsgate.response';

@Injectable()
export class SmsgateProvider implements ISmsProvider {
  private readonly logger = new LoggerService(SmsgateProvider.name);

  private readonly apiKey: string;
  private readonly senderAddress: string;
  private readonly primaryBaseUrl: string;
  private readonly fallbackBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SMSGATE_API_KEY') || '';
    this.senderAddress =
      this.configService.get<string>('SMSGATE_SENDER_ADDRESS') ||
      SMS_CONSTANTS.DEFAULT_SENDER_ADDRESS;
    this.primaryBaseUrl = this.normalizeBaseUrl(
      this.configService.get<string>('SMSGATE_API_URL'),
      SMS_CONSTANTS.DEFAULT_PRIMARY_URL,
    );
    this.fallbackBaseUrl = this.normalizeBaseUrl(
      this.configService.get<string>('SMSGATE_FALLBACK_URL'),
      SMS_CONSTANTS.DEFAULT_FALLBACK_URL,
    );
    this.timeoutMs =
      this.configService.get<number>('SMSGATE_TIMEOUT') ||
      SMS_CONSTANTS.DEFAULT_TIMEOUT_MS;
  }

  private normalizeBaseUrl(rawUrl?: string, defaultUrl: string = ''): string {
    if (!rawUrl || !rawUrl.trim()) {
      return defaultUrl;
    }
    return rawUrl
      .trim()
      .replace(/\/api\/v1\/sms\/?.*$/, '')
      .replace(/\/+$/, '');
  }

  /**
   * Выполняет HTTP-запрос к API SMSGate с автоматическим переключением
   * на резервный сервер (failover) при сетевых сбоях или таймаутах.
   */
  private async executeWithFallback<T>(
    path: string,
    options: RequestInit,
  ): Promise<T> {
    const primaryUrl = `${this.primaryBaseUrl}${path}`;
    const fallbackUrl = `${this.fallbackBaseUrl}${path}`;

    const headers: Record<string, string> = {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      return await this.fetchWithTimeout<T>(primaryUrl, {
        ...options,
        headers,
      });
    } catch (primaryError: any) {
      // Если ошибка клиентская (4xx) — переключаться на резервный сервер нет смысла
      if (
        primaryError?.status &&
        primaryError.status >= 400 &&
        primaryError.status < 500
      ) {
        throw primaryError;
      }

      this.logger.warn(
        `Основной шлюз SMSGate (${primaryUrl}) недоступен: ${primaryError?.message || primaryError}. Переключаемся на резервный (${fallbackUrl})...`,
      );

      try {
        return await this.fetchWithTimeout<T>(fallbackUrl, {
          ...options,
          headers,
        });
      } catch (fallbackError: any) {
        this.logger.error(
          `Оба шлюза SMSGate недоступны! Ошибка резервного шлюза: ${fallbackError?.message || fallbackError}`,
        );
        throw fallbackError;
      }
    }
  }

  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      const text = await response.text();
      let data: any;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      if (!response.ok) {
        const error: any = new Error(
          data?.Title ||
            data?.message ||
            data?.error ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const timeoutError: any = new Error(
          `Превышено время ожидания ответа SMSGate (${this.timeoutMs}ms)`,
        );
        timeoutError.isTimeout = true;
        throw timeoutError;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Отправка одиночного SMS сообщения
   */
  async sendSingle(
    options: SendSingleSmsOptions,
  ): Promise<SmsGateSendResponse> {
    const formattedPhone = PhoneFormatter.normalize(options.phone);

    const payload: SmsGateSinglePayload = {
      PhoneNumber: formattedPhone,
      Text: options.message,
      SenderAddress: options.senderAddress || this.senderAddress,
      Priority: options.priority ?? SmsPriority.NORMAL,
      SmsType: options.smsType ?? SmsType.COMMON,
      ...(options.scheduledAt
        ? {
            ScheduledAt:
              options.scheduledAt instanceof Date
                ? options.scheduledAt.toISOString()
                : options.scheduledAt,
          }
        : {}),
      ...(options.expiresIn !== undefined
        ? { ExpiresIn: options.expiresIn }
        : {}),
      ...(options.label ? { SmsLabel: options.label } : {}),
      ...(options.clientMessageId
        ? { ClientMessageId: options.clientMessageId }
        : {}),
    };

    return await this.executeWithFallback<SmsGateSendResponse>(
      SMS_CONSTANTS.API_PATHS.SEND_SINGLE,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  /**
   * Массовая отправка SMS сообщений (Bulk)
   */
  async sendBulk(items: SendSingleSmsOptions[]): Promise<SmsGateBulkResponse> {
    const payloads: SmsGateSinglePayload[] = items.map((item) => ({
      PhoneNumber: PhoneFormatter.normalize(item.phone),
      Text: item.message,
      SenderAddress: item.senderAddress || this.senderAddress,
      Priority: item.priority ?? SmsPriority.NORMAL,
      SmsType: item.smsType ?? SmsType.BATCH,
      ...(item.scheduledAt
        ? {
            ScheduledAt:
              item.scheduledAt instanceof Date
                ? item.scheduledAt.toISOString()
                : item.scheduledAt,
          }
        : {}),
      ...(item.expiresIn !== undefined ? { ExpiresIn: item.expiresIn } : {}),
      ...(item.label ? { SmsLabel: item.label } : {}),
      ...(item.clientMessageId
        ? { ClientMessageId: item.clientMessageId }
        : {}),
    }));

    return await this.executeWithFallback<SmsGateBulkResponse>(
      SMS_CONSTANTS.API_PATHS.SEND_BULK,
      {
        method: 'POST',
        body: JSON.stringify(payloads),
      },
    );
  }

  /**
   * Получение статуса доставки сообщения по его MessageId
   */
  async getStatus(messageId: string | number): Promise<SmsGateStatusResponse> {
    return await this.executeWithFallback<SmsGateStatusResponse>(
      SMS_CONSTANTS.API_PATHS.GET_STATUS(messageId),
      {
        method: 'GET',
      },
    );
  }

  /**
   * Метод обратной совместимости для старых прямых вызовов provider.send(...)
   */
  async send(request: SmsgateRequest): Promise<SmsgateResponse> {
    return await this.sendSingle({
      phone: request.phone,
      message: request.message,
      priority: request.priority,
      smsType: request.smsType,
      scheduledAt: request.scheduledAt,
      expiresIn: request.expiresIn,
      label: request.label,
      clientMessageId: request.clientMessageId,
    });
  }
}
