import { SmsLogStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { SmsgateProvider } from '@/sms/providers/smsgate.provider';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoggerService } from '@/logger/logger.service';
import { SendSmsOptions } from '@/sms/types';

@Injectable()
export class SmsService {
  private provider = new SmsgateProvider();

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async send({ phone, message, purpose }: SendSmsOptions) {
    try {
      const response = await this.provider.send({
        phone,
        message,
        label: purpose,
      });

      await this.prisma.smsLog.create({
        data: {
          phone,
          message,
          purpose,
          provider: 'SMS GATE',
          status:
            response.MessageResult === 'OK'
              ? SmsLogStatus.SENT
              : SmsLogStatus.FAILED,
          messageId: response.MessageId,
        },
      });

      return { success: true };
    } catch (error: any) {
      const smsLog = await this.prisma.smsLog.create({
        data: {
          phone,
          message,
          purpose,
          status: SmsLogStatus.FAILED,
          provider: 'SMS GATE',
          error: error?.Title || error?.message || 'Unknown error',
        },
      });

      this.logger.error('Ошибка отправки SMS код', {
        smsLogId: smsLog.id,
        error,
      });

      return { success: false };
    }
  }
}
