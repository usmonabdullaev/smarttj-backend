import { SmsMessageState } from '@/sms/enums';

export interface SmsStatusResponse {
  MessageId: string;
  CommandStatus: string;
  MessageState: SmsMessageState | string;
  DateSubmitted?: string;
  DateDone?: string;
}
