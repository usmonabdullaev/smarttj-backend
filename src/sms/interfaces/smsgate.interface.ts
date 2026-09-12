export interface SmsGateSinglePayload {
  PhoneNumber: string;
  Text: string;
  SenderAddress: string;
  Priority?: number;
  SmsType: number;
  ScheduledAt?: string;
  ExpiresIn?: number;
  SmsLabel?: string;
  ClientMessageId?: string;
}

export interface SmsGateSendResponse {
  MessageId: string;
  MessageResult: string;
  MessageError: boolean;
  Title?: string;
}

export interface SmsGateStatusResponse {
  MessageId: string;
  CommandStatus: string;
  MessageState: string;
  DateSubmitted?: string;
  DateDone?: string;
}

export interface SmsGateBulkResponse {
  Added: number;
}
