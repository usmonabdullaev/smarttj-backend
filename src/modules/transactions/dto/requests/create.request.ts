import { TransactionStatus } from '@prisma/client';

export interface CreateRequest {
  userId: string;
  orderId: string;
  amount: number;
  commissionRate?: number;
  commissionAmount?: number;
  netAmount?: number;
  status?: TransactionStatus;
  provider?: string;
  providerId?: string;
}
