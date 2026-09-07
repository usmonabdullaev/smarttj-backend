import { Injectable } from '@nestjs/common';

import { ApplicationsRepository } from './applications.repository';
import { CreateRequest } from './dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly repository: ApplicationsRepository) {}

  async create(dto: CreateRequest) {
    return await this.repository.create(dto);
  }
}
