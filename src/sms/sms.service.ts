import { Injectable } from '@nestjs/common';
import { SmsLogStatus } from '@prisma/client';

import { MockSmsProvider } from './providers/mock.provider';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SendSmsOptions } from './types';

@Injectable()
export class SmsService {
  private provider = new MockSmsProvider();

  constructor(private readonly prisma: PrismaService) {}

  async send({ phone, message, purpose }: SendSmsOptions) {
    try {
      this.provider.send(phone, message);

      await this.prisma.smsLog.create({
        data: {
          phone,
          message,
          purpose,
          status: SmsLogStatus.SENT,
          provider: 'mock',
        },
      });

      return { success: true };
    } catch (error) {
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
