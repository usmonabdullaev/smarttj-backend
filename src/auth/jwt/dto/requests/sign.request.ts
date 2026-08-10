import { UserRole } from '@prisma/client';

export interface SignRequest {
  userId: string;
  sessionId: string;
  role: UserRole;
}
