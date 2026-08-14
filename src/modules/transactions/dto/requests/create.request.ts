import { TransactionStatus } from '@prisma/client';

export interface CreateRequest {
  userId: string;
  orderId: string;
  amount: number;
  status?: TransactionStatus;
  provider?: string;
  providerId?: string;
}
