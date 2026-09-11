export enum AlifGate {
  KORTI_MILLI = 'korti_milli',
  WALLET = 'wallet',
  SALOM = 'salom',
  CYBERSOURCE_CHECKOUT = 'cybersource_checkout',
}

export type AlifPaymentStatus = 'pending' | 'ok' | 'failed' | 'canceled';

export interface AlifInitPaymentPayload {
  order_id: string;
  token: string;
  key: string;
  callback_url: string;
  return_url: string;
  amount: string; // Формат "100.50" (ровно 2 знака)
  info: string;
  email?: string;
  phone?: string;
  gate?: string;
}

export interface AlifInitPaymentResponse {
  code: number;
  message: string;
  url?: string;
}

export interface AlifCheckStatusPayload {
  orderId: string;
  key: string;
  token: string;
}

export interface AlifCheckStatusResponse {
  orderId?: string;
  transactionId?: string | number;
  status?: AlifPaymentStatus;
  token?: string;
  amount?: number | string;
  phone?: string;
  url?: string;
  code?: number;
  message?: string;
}

export interface AlifCancelPaymentPayload {
  key: string;
  transaction_id: string;
  token: string;
  amount: string; // Формат "100.50"
  reason?: string;
}

export interface AlifCancelPaymentResponse {
  code: number;
  message: string;
}
