import { SmsLogPurpose } from '@prisma/client';
import { SmsPriority, SmsType } from '@/sms/enums';

export interface BulkSmsItemRequest {
  phone: string;
  message: string;
  purpose?: SmsLogPurpose;
  priority?: SmsPriority;
  smsType?: SmsType;
  expiresIn?: number;
  scheduledAt?: string | Date;
  label?: string;
  clientMessageId?: string;
}

export interface SendBulkRequest {
  items: BulkSmsItemRequest[];
}
