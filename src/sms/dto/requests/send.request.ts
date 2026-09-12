import { SmsLogPurpose } from '@prisma/client';
import { SmsPriority, SmsType } from '@/sms/enums';

export interface SendRequest {
  phone: string;
  message: string;
  purpose: SmsLogPurpose;
  priority?: SmsPriority;
  smsType?: SmsType;
  expiresIn?: number;
  scheduledAt?: string | Date;
  label?: string;
  clientMessageId?: string;
}
