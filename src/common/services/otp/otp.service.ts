import { Injectable } from '@nestjs/common';

import { PasswordService } from '../password/password.service';
import { generateOtp } from './utils/generate';

@Injectable()
export class OtpService {
  constructor(private readonly passwordService: PasswordService) {}

  generateOtp() {
    return generateOtp();
  }

  async hash(code: string) {
    return await this.passwordService.hash(code);
  }

  async verify(hash: string, code: string) {
    return await this.passwordService.verify(hash, code);
  }
}
