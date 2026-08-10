export interface SmsgateRequest {
  phone: string;
  message: string;
  priority?: 0 | 1 | 2;
  smsType?: 1 | 2 | 3;
  scheduledAt?: string;
  expiresIn?: number;
  label?: string;
}
