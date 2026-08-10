import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  bong() {
    return 'Bong';
  }
}
