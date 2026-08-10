import { SmsLogPurpose } from '@prisma/client';

export interface SendRequest {
  phone: string;
  message: string;
  purpose: SmsLogPurpose;
}
