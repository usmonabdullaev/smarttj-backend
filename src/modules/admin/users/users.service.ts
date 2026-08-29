import { Injectable } from '@nestjs/common';

import { BaseRepository, UserRepository } from '@/common/repositories';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly baseRepository: BaseRepository,
  ) {}

  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.baseRepository.transaction([
      this.userRepository.findMany(skip, limit),
      this.userRepository.count(),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
