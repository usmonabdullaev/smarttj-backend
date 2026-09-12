export interface SmsgateResponse {
  MessageId: string;
  MessageResult: string;
  MessageError: boolean;
  Title?: string;
  Detail?: string;
}
