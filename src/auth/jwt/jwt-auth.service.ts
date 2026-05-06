import { JwtSignOptions } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtSignDto } from '@/auth/jwt/dto/jwt-sign.dto';

@Injectable()
export class JwtAuthService {
  sign({ userId, sessionId, role }: JwtSignDto, options?: JwtSignOptions) {
    return jwt.sign(
      { userId, sessionId, role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
        ...options,
      },
    );
  }
}
