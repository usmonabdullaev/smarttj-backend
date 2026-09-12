import { SmsLogPurpose, SmsLogStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';
import { SMS_CONSTANTS } from './constants/sms.constants';
import { SmsPriority, SmsType } from './enums';
import {
  BulkSmsItemRequest,
  SendBulkRequest,
  SendOtpRequest,
  SendRequest,
} from './dto/requests';
import { SmsStatusResponse } from './dto/responses';
import { SmsgateProvider } from './providers/smsgate.provider';
import { PhoneFormatter } from './utils/phone-formatter.util';

@Injectable()
export class SmsService {
  private readonly logger = new LoggerService(SmsService.name);

  constructor(
    private readonly provider: SmsgateProvider,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Отправка одиночного SMS сообщения.
   * Полностью обратно совместим со старыми вызовами.
   * Автоматически определяет параметры для OTP (приоритет 2, тип 2, срок жизни 300 сек).
   */
  async send(dto: SendRequest): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const cleanPhone = PhoneFormatter.normalize(dto.phone);

    const isOtp =
      dto.purpose === SmsLogPurpose.LOGIN ||
      dto.purpose === SmsLogPurpose.REGISTER ||
      dto.purpose === SmsLogPurpose.RESET_PASSWORD;

    const smsType = dto.smsType ?? (isOtp ? SmsType.OTP : SmsType.COMMON);
    const priority =
      dto.priority ?? (isOtp ? SmsPriority.HIGH : SmsPriority.NORMAL);
    const expiresIn =
      dto.expiresIn ??
      (isOtp ? SMS_CONSTANTS.DEFAULT_OTP_EXPIRES_IN_SEC : undefined);
    const label = dto.label ?? dto.purpose;

    try {
      const response = await this.provider.sendSingle({
        phone: cleanPhone,
        message: dto.message,
        priority,
        smsType,
        expiresIn,
        scheduledAt: dto.scheduledAt,
        label,
        clientMessageId: dto.clientMessageId,
      });

      const isSuccess =
        response.MessageResult === 'OK' && !response.MessageError;

      await this.prisma.smsLog.create({
        data: {
          phone: cleanPhone,
          message: dto.message,
          purpose: dto.purpose,
          provider: SMS_CONSTANTS.PROVIDER_NAME,
          status: isSuccess ? SmsLogStatus.SENT : SmsLogStatus.FAILED,
          messageId: response.MessageId,
        },
      });

      return {
        success: isSuccess,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      const errorMessage =
        error?.Title || error?.message || error?.error || 'Unknown error';

      const smsLog = await this.prisma.smsLog.create({
        data: {
          phone: cleanPhone,
          message: dto.message,
          purpose: dto.purpose,
          status: SmsLogStatus.FAILED,
          provider: SMS_CONSTANTS.PROVIDER_NAME,
          error:
            typeof errorMessage === 'string'
              ? errorMessage
              : JSON.stringify(errorMessage),
        },
      });

      this.logger.error('Ошибка отправки SMS', {
        phone: PhoneFormatter.mask(cleanPhone),
        smsLogId: smsLog.id,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Специализированный метод для отправки одноразовых паролей и кодов авторизации
   */
  async sendOtp(dto: SendOtpRequest): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const purpose = dto.purpose || SmsLogPurpose.LOGIN;
    return await this.send({
      phone: dto.phone,
      message: `Ваш код подтверждения: ${dto.code}`,
      purpose,
      smsType: SmsType.OTP,
      priority: SmsPriority.HIGH,
      expiresIn: dto.expiresIn ?? SMS_CONSTANTS.DEFAULT_OTP_EXPIRES_IN_SEC,
      label: 'OTP',
    });
  }

  /**
   * Отправка сервисного или транзакционного уведомления
   */
  async sendNotification(
    phone: string,
    text: string,
    options?: {
      purpose?: SmsLogPurpose;
      label?: string;
      priority?: SmsPriority;
    },
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    return await this.send({
      phone,
      message: text,
      purpose: options?.purpose || SmsLogPurpose.LOGIN,
      smsType: SmsType.COMMON,
      priority: options?.priority ?? SmsPriority.NORMAL,
      label: options?.label ?? 'NOTIFICATION',
    });
  }

  /**
   * Массовая отправка SMS сообщений (рассылка)
   */
  async sendBulk(request: SendBulkRequest): Promise<{
    success: boolean;
    added: number;
    error?: string;
  }> {
    try {
      const payloads = request.items.map((item: BulkSmsItemRequest) => ({
        phone: PhoneFormatter.normalize(item.phone),
        message: item.message,
        priority: item.priority ?? SmsPriority.NORMAL,
        smsType: item.smsType ?? SmsType.BATCH,
        expiresIn: item.expiresIn,
        scheduledAt: item.scheduledAt,
        label: item.label,
        clientMessageId: item.clientMessageId,
      }));

      const response = await this.provider.sendBulk(payloads);

      // Логируем все отправленные сообщения
      await this.prisma.smsLog.createMany({
        data: request.items.map((item) => ({
          phone: PhoneFormatter.normalize(item.phone),
          message: item.message,
          purpose: item.purpose || SmsLogPurpose.LOGIN,
          provider: SMS_CONSTANTS.PROVIDER_NAME,
          status: SmsLogStatus.SENT,
        })),
      });

      return {
        success: true,
        added: response.Added,
      };
    } catch (error: any) {
      const errorMessage =
        error?.Title || error?.message || error?.error || 'Unknown error';

      this.logger.error('Ошибка массовой отправки SMS (Bulk)', {
        count: request.items.length,
        error: errorMessage,
      });

      return {
        success: false,
        added: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Получение текущего статуса доставки SMS по его MessageId
   */
  async getStatus(messageId: string | number): Promise<SmsStatusResponse> {
    return await this.provider.getStatus(messageId);
  }

  /**
   * Синхронизация статуса отправки в БД по идентификатору SmsLog
   */
  async syncStatus(smsLogId: string): Promise<SmsStatusResponse | null> {
    const log = await this.prisma.smsLog.findUnique({
      where: { id: smsLogId },
    });

    if (!log || !log.messageId) {
      return null;
    }

    const status = await this.provider.getStatus(log.messageId);

    // Если статус перешел в Delivered, актуализируем запись
    if (status.MessageState === 'Delivered') {
      await this.prisma.smsLog.update({
        where: { id: smsLogId },
        data: { status: SmsLogStatus.SENT },
      });
    } else if (
      status.MessageState === 'Undeliverable' ||
      status.MessageState === 'Expired' ||
      status.MessageState === 'Rejected'
    ) {
      await this.prisma.smsLog.update({
        where: { id: smsLogId },
        data: {
          status: SmsLogStatus.FAILED,
          error: `MessageState: ${status.MessageState}`,
        },
      });
    }

    return status;
  }
}
