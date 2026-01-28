import { SmsLogPurpose } from '@prisma/client';

export type SendSmsOptions = {
  phone: string;
  message: string;
  purpose: SmsLogPurpose;
};
