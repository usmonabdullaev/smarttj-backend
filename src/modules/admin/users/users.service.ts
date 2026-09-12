import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';

import { BaseRepository, UserRepository } from '@/common/repositories';
import { GetAllRequest } from './dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly baseRepository: BaseRepository,
  ) {}

  async getAll(query: GetAllRequest) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: UserRole.USER,

      ...(query.q && {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { phone: { contains: query.q, mode: 'insensitive' } },
          { email: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
      ...(query.emailVerified !== undefined && {
        emailVerified: query.emailVerified,
      }),
      ...(query.regionId && {
        regionId: query.regionId,
      }),
    };

    const [users, total] = await this.baseRepository.transaction([
      this.userRepository.findMany(skip, limit, where),
      this.userRepository.count(where),
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

  async getById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
