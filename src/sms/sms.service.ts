import { SmsLogStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { SmsgateProvider } from '@/sms/providers/smsgate.provider';
import { PrismaService } from '@/database/prisma/prisma.service';
import { SendSmsOptions } from '@/sms/types';

@Injectable()
export class SmsService {
  private provider = new SmsgateProvider();

  constructor(private readonly prisma: PrismaService) {}

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
          error: undefined, // FIX
        },
      });

      return { success: true };
    } catch (error: any) {
      await this.prisma.smsLog.create({
        data: {
          phone,
          message,
          purpose,
          status: SmsLogStatus.FAILED,
          provider: 'mock',
          error: error?.message ?? 'Unknown error',
        },
      });

      throw error;
    }
  }
}
