import { SmsPriority, SmsType } from '@/sms/enums';

export interface SmsgateRequest {
  phone: string;
  message: string;
  priority?: SmsPriority | number;
  smsType?: SmsType | number;
  scheduledAt?: string;
  expiresIn?: number;
  label?: string;
  clientMessageId?: string;
}
