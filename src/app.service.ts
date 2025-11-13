import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  bong(): string {
    return 'Bong';
  }
}
