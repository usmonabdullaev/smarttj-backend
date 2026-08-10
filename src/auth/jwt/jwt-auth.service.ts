import { JwtSignOptions } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { SignRequest } from '@/auth/jwt/dto/requests/sign.request';

@Injectable()
export class JwtAuthService {
  sign(dto: SignRequest, options?: JwtSignOptions) {
    return jwt.sign(
      { userId: dto.userId, sessionId: dto.sessionId, role: dto.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
        ...options,
      },
    );
  }
}
