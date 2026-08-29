import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  async hash(password: string) {
    return await argon2.hash(password, { type: argon2.argon2id });
  }

  async verify(hash: string, password: string) {
    return await argon2.verify(hash, password);
  }
}
