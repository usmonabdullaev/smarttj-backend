import { UserRole } from '@prisma/client';

export interface JwtSignDto {
  userId: string;
  sessionId: string;
  role: UserRole;
}
