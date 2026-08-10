import { UserRole } from '@prisma/client';

export interface ValidateRequest {
  userId: string;
  sessionId: string;
  role: UserRole;
}
