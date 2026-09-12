import { SmsLogPurpose } from '@prisma/client';

export interface SendOtpRequest {
  phone: string;
  code: string;
  purpose?: SmsLogPurpose;
  expiresIn?: number;
}
