import { SmsPriority, SmsType } from '../enums';
import {
  SmsGateBulkResponse,
  SmsGateSendResponse,
  SmsGateStatusResponse,
} from './smsgate.interface';

export interface SendSingleSmsOptions {
  phone: string;
  message: string;
  senderAddress?: string;
  priority?: SmsPriority;
  smsType?: SmsType;
  scheduledAt?: string | Date;
  expiresIn?: number;
  label?: string;
  clientMessageId?: string;
}

export interface ISmsProvider {
  sendSingle(options: SendSingleSmsOptions): Promise<SmsGateSendResponse>;
  sendBulk(items: SendSingleSmsOptions[]): Promise<SmsGateBulkResponse>;
  getStatus(messageId: string | number): Promise<SmsGateStatusResponse>;
}
