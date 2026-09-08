import { Injectable, NotFoundException } from '@nestjs/common';

import { AdminApplicationsRepository } from './applications.repository';
import { GetListRequest, UpdateRequest } from './dto';

@Injectable()
export class AdminApplicationsService {
  constructor(private readonly repository: AdminApplicationsRepository) {}

  async getList(query: GetListRequest) {
    const page = query.page || 1;
    const limit = query.limit || 18;
    const skip = (page - 1) * limit;

    return await this.repository.getList(skip, limit, query.status);
  }

  async getById(id: string) {
    const application = await this.repository.getById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, dto: UpdateRequest) {
    const application = await this.repository.getById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return await this.repository.updateStatus(id, dto.status);
  }

  async delete(id: string) {
    const application = await this.repository.getById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return await this.repository.delete(id);
  }
}
